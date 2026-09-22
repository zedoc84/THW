import { THW, filePicker } from "../config.mjs";
import { THWListsConfig } from "../apps/lists-config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ActorSheetV2 } = foundry.applications.sheets;

/** Construit les options d'un <select> côté contexte : aucun helper Handlebars requis. */
function options(values, current, blankLabel) {
  const out = [];
  if (blankLabel !== undefined) out.push({ value: "", label: blankLabel, selected: !current });
  for (const v of values) {
    const value = typeof v === "object" ? v.value : v;
    const label = typeof v === "object" ? v.label : String(v);
    out.push({ value: String(value), label, selected: String(value) === String(current ?? "") });
  }
  return out;
}

export class THWActorSheet extends HandlebarsApplicationMixin(ActorSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["thw", "sheet", "actor"],
    position: { width: 660, height: 780 },
    window: { resizable: true, icon: "fa-solid fa-user-shield" },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      editImage: THWActorSheet.#onEditImage,
      resetImage: THWActorSheet.#onResetImage,
      rollStat: THWActorSheet.#onRollStat,
      createEmbedded: THWActorSheet.#onCreateEmbedded,
      editEmbedded: THWActorSheet.#onEditEmbedded,
      deleteEmbedded: THWActorSheet.#onDeleteEmbedded,
      postEmbedded: THWActorSheet.#onPostEmbedded,
      addListValue: THWActorSheet.#onAddListValue,
      openLists: THWActorSheet.#onOpenLists
    }
  };

  static PARTS = {
    form: { template: "systems/thw/templates/actor/actor-sheet.hbs", scrollable: [".thw-scroll"] }
  };

  async _prepareContext(opts) {
    const ctx = await super._prepareContext(opts);
    const sys = this.document.system;

    const list = key => game.settings.get("thw", key) ?? [];
    const dash = game.i18n.localize("THW.dash");

    ctx.system = sys;
    ctx.editable = this.isEditable;
    ctx.raceOptions   = options(list("races"),   sys.race,   dash);
    ctx.clsOptions    = options(list("classes"), sys.cls,    dash);
    ctx.weaponOptions = options(list("weapons"), sys.weapon, dash);
    ctx.acOptions     = options(THW.acValues, sys.ac);
    ctx.roleOptions   = options(
      Object.entries(THW.roles).map(([value, label]) => ({ value, label: game.i18n.localize(label) })),
      sys.role
    );
    const roleKey = sys.role;
    ctx.stats = (THW.roleStats[roleKey] ?? ["rep"]).map(key => ({
      key, label: THW.statLabels[key] ?? key.toUpperCase(), value: sys[key] ?? 0
    }));
    ctx.hiddenStats = Object.keys(THW.statLabels)
      .filter(k => !(THW.roleStats[roleKey] ?? []).includes(k));

    const byName = (a, b) => a.name.localeCompare(b.name, game.i18n.lang);
    ctx.attributes = this.document.items.filter(i => i.type === "attribute").sort(byName);
    ctx.gear = this.document.items.filter(i => i.type === "item").sort(byName);
    ctx.notesHTML = sys.notes ?? "";
    ctx.isGM = game.user.isGM;
    return ctx;
  }

  /* ---------- actions ---------- */

  /**
   * Ouvre le sélecteur de fichiers sur le champ visé par data-edit.
   * ApplicationV2 ne câble plus data-edit tout seul : il faut une action.
   */
  static async #onEditImage(event, target) {
    if (!this.isEditable) return;
    const attr = target.dataset.edit || "img";
    const FP = filePicker();
    const picker = new FP({
      type: "image",
      current: foundry.utils.getProperty(this.document, attr) || "",
      callback: path => this.document.update({ [attr]: path }),
      top: (this.position.top ?? 0) + 40,
      left: (this.position.left ?? 0) + 10
    });
    return picker.browse();
  }

  /** Clic droit sur le portrait : retour à l'icône par défaut du type. */
  static async #onResetImage(event, target) {
    if (!this.isEditable) return;
    const attr = target.dataset.edit || "img";
    const fallback = THW.defaultImages[this.document.type] ?? "icons/svg/mystery-man.svg";
    await this.document.update({ [attr]: fallback });
  }

  /**
   * Test THW : chaque dé est comparé séparément à la valeur, jamais additionné.
   *   tous les dés <= valeur  -> Success
   *   une partie seulement    -> Partial success
   *   aucun                   -> Failure
   */
  static async #onRollStat(event, target) {
    const key = target.dataset.stat;
    const value = Number(this.document.system[key] ?? 0);
    const n = Number(game.settings.get("thw", "dicePerTest")) || 2;

    const roll = await new Roll(`${n}d6`).evaluate();
    const dice = roll.dice[0]?.results?.map(r => r.result) ?? [];
    const passed = dice.filter(d => d <= value).length;

    const outcomeKey = passed === dice.length ? "success"
                     : passed > 0 ? "partial"
                     : "failure";
    const outcome = THW.outcomes[outcomeKey];
    const label = THW.statLabels[key] ?? key.toUpperCase();

    const content = `
      <div class="thw-roll">
        <header><b>${label}</b> <span class="target">${value}</span></header>
        <div class="dice">${dice.map(d =>
          `<span class="die ${d <= value ? "pass" : "fail"}">${d}</span>`).join("")}</div>
        <div class="outcome ${outcome.css}">${game.i18n.localize(outcome.label)}</div>
        <footer>${game.i18n.format("THW.Roll.detail", { n: passed, total: dice.length, value })}</footer>
      </div>`;

    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      content,
      rolls: [roll],
      sound: CONFIG.sounds.dice,
      flags: { thw: { stat: key, value, dice, outcome: outcomeKey } }
    });
  }

  /**
   * Ajoute une valeur à une liste déroulante sans quitter la fiche,
   * puis la sélectionne sur cet acteur.
   * Les listes sont des réglages de monde : seul un MJ peut y écrire.
   */
  static async #onAddListValue(event, target) {
    const { list, field, label } = target.dataset;
    if (!game.user.isGM) {
      ui.notifications.warn(game.i18n.localize("THW.List.gmOnly"));
      return;
    }
    const value = await foundry.applications.api.DialogV2.prompt({
      window: { title: game.i18n.format("THW.List.addTitle", { label }) },
      content: `<input type="text" name="value" maxlength="40" autofocus
                  placeholder="${game.i18n.localize("THW.Settings.addPlaceholder")}">`,
      ok: {
        label: game.i18n.localize("THW.Settings.add"),
        callback: (ev, button) => button.form.elements.value.value.trim()
      },
      rejectClose: false
    });
    if (!value) return;

    const current = (game.settings.get("thw", list) ?? []).slice();
    if (current.some(v => v.toLowerCase() === value.toLowerCase())) {
      ui.notifications.warn(game.i18n.format("THW.Settings.duplicate", { value }));
    } else {
      current.push(value);
      current.sort((a, b) => a.localeCompare(b, game.i18n.lang, { sensitivity: "base" }));
      await game.settings.set("thw", list, current);
    }
    await this.document.update({ [`system.${field}`]: value });
    this.render();
  }

  static #onOpenLists() {
    if (!game.user.isGM) {
      ui.notifications.warn(game.i18n.localize("THW.List.gmOnly"));
      return;
    }
    new THWListsConfig().render(true);
  }

  static async #onCreateEmbedded(event, target) {
    const type = target.dataset.type || "attribute";
    const [item] = await this.document.createEmbeddedDocuments("Item", [{
      name: game.i18n.localize(type === "item" ? "THW.Item.new" : "THW.Attribute.new"),
      type
    }]);
    item?.sheet?.render(true);
  }

  #embedded(target) {
    return this.document.items.get(target.closest("[data-item-id]")?.dataset.itemId);
  }

  static #onEditEmbedded(event, target) {
    this.#embedded(target)?.sheet?.render(true);
  }

  static async #onDeleteEmbedded(event, target) {
    const item = this.#embedded(target);
    if (!item) return;
    const ok = await foundry.applications.api.DialogV2.confirm({
      window: { title: game.i18n.localize("THW.Embedded.deleteTitle") },
      content: `<p>${game.i18n.format("THW.Embedded.deleteBody", { name: item.name })}</p>`
    });
    if (ok) await item.delete();
  }

  static async #onPostEmbedded(event, target) {
    const item = this.#embedded(target);
    if (!item) return;
    await ChatMessage.create({
      speaker: ChatMessage.getSpeaker({ actor: this.document }),
      content: `<div class="thw-attr"><h4>${foundry.utils.escapeHTML(item.name)}</h4>${item.system.description || ""}</div>`
    });
  }

}
