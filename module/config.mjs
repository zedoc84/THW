export const THW = {};

/* Rôles d'un acteur "character" — libellés d'organisation, pas de contenu de règles. */
THW.roles = {
  leader:   "THW.Role.leader",
  grunt:    "THW.Role.grunt",
  creature: "THW.Role.creature"
};

/* Stats affichées selon le rôle. Les valeurs masquées restent dans le document :
   repasser un acteur en Leader fait réapparaître ses REP et PEP intacts. */
THW.roleStats = {
  leader:   ["rep", "pep", "sav"],
  grunt:    ["rep"],
  creature: ["rep"]
};
THW.statLabels = { rep: "REP", pep: "PEP", sav: "SAV" };

/* Issues d'un test : les dés sont comparés à la valeur, jamais additionnés. */
THW.outcomes = {
  success: { label: "THW.Roll.success", css: "success" },
  partial: { label: "THW.Roll.partial", css: "partial" },
  failure: { label: "THW.Roll.failure", css: "failure" }
};

/* AC : 2 = protection la plus faible, 8 = la plus forte. */
THW.acValues = [2, 3, 4, 5, 6, 7, 8];

THW.listKeys = ["races", "classes", "weapons"];

THW.defaultSlotCost = { leader: 0, grunt: 1, creature: 1 };

/* Icône appliquée à la création d'un document, quand Foundry n'en impose pas.
   Modifiable par macro : game.settings.set("thw", "defaultImages", {...}) */
THW.defaultImages = {
  character: "icons/svg/mystery-man.svg",
  attribute: "icons/svg/aura.svg",
  item:      "icons/svg/item-bag.svg"
};
THW.defaultTotalSlots = 10;
THW.defaultDicePerTest = 2;

/* L'emplacement des collections et des helpers Handlebars a bougé entre V12 et V14.
   On résout défensivement pour éviter un plantage au chargement. */
export function collection(name) {
  return foundry.documents?.collections?.[name] ?? globalThis[name];
}
/* Le FilePicker a migré vers foundry.applications.apps en V13. */
export function filePicker() {
  return foundry.applications?.apps?.FilePicker?.implementation ?? globalThis.FilePicker;
}
export function hbsApi() {
  return foundry.applications?.handlebars ?? {
    loadTemplates: globalThis.loadTemplates,
    renderTemplate: globalThis.renderTemplate
  };
}
