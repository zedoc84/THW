import { THW } from "../config.mjs";

const { ApplicationV2, HandlebarsApplicationMixin } = foundry.applications.api;

/**
 * Une ligue = un dossier d'Acteurs. Pas d'état parallèle à synchroniser :
 * ajouter quelqu'un à une ligue, c'est le déplacer dans le dossier.
 */
export class THWRoster extends HandlebarsApplicationMixin(ApplicationV2) {
  static DEFAULT_OPTIONS = {
    id: "thw-roster",
    classes: ["thw", "thw-roster"],
    position: { width: 620, height: 640 },
    window: { title: "THW.Roster.title", resizable: true },
    actions: {
      pickFolder: THWRoster.#onPickFolder,
      openActor: THWRoster.#onOpenActor,
      removeActor: THWRoster.#onRemoveActor
    }
  };

  static PARTS = {
    body: { template: "systems/thw/templates/apps/roster.hbs", scrollable: [".thw-scroll"] }
  };

  #folderId = null;

  async _prepareContext() {
    const folders = game.folders.filter(f => f.type === "Actor");
    if (!this.#folderId && folders.length) this.#folderId = folders[0].id;
    const folder = folders.find(f => f.id === this.#folderId) ?? null;

    const costs = game.settings.get("thw", "slotCost") ?? THW.defaultSlotCost;
    const total = Number(game.settings.get("thw", "totalSlots")) || THW.defaultTotalSlots;

    const members = (folder?.contents ?? []).map(a => {
      const key = a.system?.slotKey ?? "grunt";
      const cost = Number(costs[key] ?? 0);
      return {
        id: a.id, name: a.name, img: a.img,
        role: game.i18n.localize(THW.roles[key] ?? "THW.Role.grunt"),
        rep: a.system?.rep ?? "-", ac: a.system?.ac ?? "-",
        cost
      };
    });

    const used = members.reduce((s, m) => s + m.cost, 0);
    return {
      folders: folders.map(f => ({ id: f.id, name: f.name, selected: f.id === this.#folderId })),
      folder, members, used, total,
      over: used > total,
      pct: total ? Math.min(100, Math.round(used / total * 100)) : 0,
      empty: !folders.length
    };
  }

  static #onPickFolder(event, target) {
    this.#folderId = target.value || target.dataset.folderId;
    this.render();
  }

  static #onOpenActor(event, target) {
    game.actors.get(target.closest("[data-actor-id]")?.dataset.actorId)?.sheet?.render(true);
  }

  static async #onRemoveActor(event, target) {
    const actor = game.actors.get(target.closest("[data-actor-id]")?.dataset.actorId);
    if (!actor) return;
    await actor.update({ folder: null });
    this.render();
  }

  _onRender(context, options) {
    super._onRender?.(context, options);
    this.element.querySelector("select[name=folder]")
      ?.addEventListener("change", ev => { this.#folderId = ev.target.value; this.render(); });
  }
}
