const fields = foundry.data.fields;

/**
 * Un Attribute THW est un Objet, pas un champ figé de la fiche.
 * Le système n'en fournit aucun : tu crées les tiens, ou tu les ranges dans
 * un compendium de monde à partir de ton propre exemplaire du jeu.
 */
export class THWAttributeData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      summary:     new fields.StringField({ required: true, blank: true, initial: "" }),
      description: new fields.HTMLField({ required: true, blank: true, initial: "" }),
      source:      new fields.StringField({ required: true, blank: true, initial: "" })
    };
  }
}
