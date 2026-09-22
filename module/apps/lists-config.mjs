import { THW } from "../config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin, DialogV2 } = foundry.applications.api;

/** Éditeur des listes déroulantes Race/Profession, Class et Weapon. */
export class THWListsConfig extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "thw-lists-config",
    classes: ["thw", "thw-lists"],
    tag: "form",
    position: { width: 560, height: "auto" },
    window: { title: "THW.Settings.listsTitle", contentClasses: ["standard-form"] },
    form: { handler: THWListsConfig.#onSubmit, closeOnSubmit: false },
    actions: {
      addValue: THWListsConfig.#onAdd,
      removeValue: THWListsConfig.#onRemove
    }
  };

  static PARTS = {
    body:    { template: "systems/thw/templates/apps/lists-config.hbs", scrollable: [".thw-scroll"] },
    footer:  { template: "templates/generic/form-footer.hbs" }
  };

  async _prepareContext() {
    return {
      lists: THW.listKeys.map(key => ({
        key,
        label: game.i18n.localize(`THW.List.${key}`),
        values: (game.settings.get("thw", key) ?? []).slice()
      })),
      buttons: [{ type: "submit", icon: "fa-solid fa-floppy-disk", label: "THW.Settings.save" }]
    };
  }

  static async #onAdd(event, target) {
    const key = target.dataset.key;
    const input = this.element.querySelector(`input[data-add="${key}"]`);
    const value = (input?.value ?? "").trim();
    if (!value) return;
    const list = (game.settings.get("thw", key) ?? []).slice();
    if (list.some(v => v.toLowerCase() === value.toLowerCase())) {
      ui.notifications.warn(game.i18n.format("THW.Settings.duplicate", { value }));
      return;
    }
    list.push(value);
    list.sort((a, b) => a.localeCompare(b, game.i18n.lang, { sensitivity: "base" }));
    await game.settings.set("thw", key, list);
    input.value = "";
    this.render();
  }

  static async #onRemove(event, target) {
    const { key, value } = target.dataset;
    const inUse = game.actors.filter(a => {
      const f = key === "races" ? "race" : key === "classes" ? "cls" : "weapon";
      return a.system?.[f] === value;
    }).length;
    if (inUse) {
      const ok = await DialogV2.confirm({
        window: { title: game.i18n.localize("THW.Settings.removeTitle") },
        content: `<p>${game.i18n.format("THW.Settings.removeInUse", { value, n: inUse })}</p>`
      });
      if (!ok) return;
    }
    const list = (game.settings.get("thw", key) ?? []).filter(v => v !== value);
    await game.settings.set("thw", key, list);
    this.render();
  }

  static async #onSubmit() {
    ui.notifications.info(game.i18n.localize("THW.Settings.saved"));
    this.close();
  }
}
