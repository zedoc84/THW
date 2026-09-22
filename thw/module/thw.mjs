import { THW, collection, hbsApi } from "./config.mjs";
import { THWCharacterData } from "./data/actor-base.mjs";
import { THWAttributeData } from "./data/item-attribute.mjs";
import { THWItemData } from "./data/item-gear.mjs";
import { THWActorSheet } from "./sheets/actor-sheet.mjs";
import { THWAttributeSheet, THWItemSheet } from "./sheets/item-sheet.mjs";
import { THWListsConfig } from "./apps/lists-config.mjs";
import { THWRoster } from "./apps/roster.mjs";

Hooks.once("init", () => {
  CONFIG.THW = THW;

  /* Modèles de données — déclarés dans system.json via documentTypes. */
  CONFIG.Actor.dataModels = {
    character: THWCharacterData
  };
  CONFIG.Item.dataModels = {
    attribute: THWAttributeData,
    item: THWItemData
  };

  /* Fiches. On retire les fiches de base pour ne laisser que les nôtres. */
  const Actors = collection("Actors");
  const Items = collection("Items");
  Actors.unregisterSheet?.("core", foundry.appv1?.sheets?.ActorSheet ?? globalThis.ActorSheet);
  Actors.registerSheet("thw", THWActorSheet, {
    types: ["character"], makeDefault: true, label: "THW.Sheet.actor"
  });
  Items.unregisterSheet?.("core", foundry.appv1?.sheets?.ItemSheet ?? globalThis.ItemSheet);
  Items.registerSheet("thw", THWAttributeSheet, {
    types: ["attribute"], makeDefault: true, label: "THW.Sheet.attribute"
  });
  Items.registerSheet("thw", THWItemSheet, {
    types: ["item"], makeDefault: true, label: "THW.Sheet.item"
  });

  registerSettings();

  hbsApi().loadTemplates([
    "systems/thw/templates/actor/actor-sheet.hbs",
    "systems/thw/templates/item/attribute-sheet.hbs",
    "systems/thw/templates/item/item-sheet.hbs",
    "systems/thw/templates/apps/lists-config.hbs",
    "systems/thw/templates/apps/roster.hbs"
  ]);
});

function registerSettings() {
  for (const key of THW.listKeys) {
    game.settings.register("thw", key, {
      scope: "world", config: false, type: Array, default: []
    });
  }
  game.settings.register("thw", "slotCost", {
    scope: "world", config: false, type: Object, default: THW.defaultSlotCost
  });
  game.settings.register("thw", "totalSlots", {
    name: "THW.Settings.totalSlots", hint: "THW.Settings.totalSlotsHint",
    scope: "world", config: true, type: Number, default: THW.defaultTotalSlots
  });
  game.settings.register("thw", "dicePerTest", {
    name: "THW.Settings.dicePerTest", hint: "THW.Settings.dicePerTestHint",
    scope: "world", config: true, type: Number, default: THW.defaultDicePerTest,
    range: { min: 1, max: 6, step: 1 }
  });
  game.settings.registerMenu("thw", "listsMenu", {
    name: "THW.Settings.listsTitle", hint: "THW.Settings.listsHint",
    label: "THW.Settings.listsButton", icon: "fa-solid fa-list",
    type: THWListsConfig, restricted: true
  });
}

/* Bouton Roster dans l'onglet Acteurs de la barre latérale. */
Hooks.on("renderActorDirectory", (app, element) => {
  const root = element instanceof HTMLElement ? element : element?.[0];
  if (!root || root.querySelector(".thw-roster-button")) return;
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = "thw-roster-button";
  btn.innerHTML = `<i class="fa-solid fa-users-rectangle"></i> ${game.i18n.localize("THW.Roster.open")}`;
  btn.addEventListener("click", () => new THWRoster().render(true));
  (root.querySelector(".header-actions") ?? root.querySelector(".directory-header") ?? root)
    .prepend(btn);
});

/* Icône par défaut à la création, quand le document n'en reçoit pas d'explicite. */
function applyDefaultImage(doc, data) {
  const generic = ["icons/svg/mystery-man.svg", "icons/svg/item-bag.svg", ""];
  const wanted = THW.defaultImages[doc.type];
  if (!wanted) return;
  if (data.img && !generic.includes(data.img)) return;
  doc.updateSource({ img: wanted });
}
Hooks.on("preCreateActor", applyDefaultImage);
Hooks.on("preCreateItem", applyDefaultImage);

/* API exposée pour les macros. */
Hooks.once("ready", () => {
  game.thw = { THWRoster, THWListsConfig, openRoster: () => new THWRoster().render(true) };
});
