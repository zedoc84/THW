const fields = foundry.data.fields;

/**
 * Objet générique porté par un personnage : arme de rechange, monture,
 * butin, équipement. Aucun effet mécanique n'est appliqué automatiquement —
 * le système ne connaît aucune règle.
 */
export class THWItemData extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      summary:     new fields.StringField({ required: true, blank: true, initial: "" }),
      quantity:    new fields.NumberField({ required: true, integer: true, min: 0, initial: 1 }),
      equipped:    new fields.BooleanField({ required: true, initial: false }),
      description: new fields.HTMLField({ required: true, blank: true, initial: "" }),
      source:      new fields.StringField({ required: true, blank: true, initial: "" })
    };
  }
}
