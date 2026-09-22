const fields = foundry.data.fields;

/** Schéma commun aux acteurs THW. */
export class THWActorBase extends foundry.abstract.TypeDataModel {
  static defineSchema() {
    return {
      idNumber: new fields.StringField({ required: true, blank: true, initial: "" }),
      rep:      new fields.NumberField({ required: true, integer: true, min: 0, max: 12, initial: 4 }),
      pep:      new fields.NumberField({ required: true, integer: true, min: 0, max: 12, initial: 0 }),
      sav:      new fields.NumberField({ required: true, integer: true, min: 0, max: 12, initial: 4 }),
      race:     new fields.StringField({ required: true, blank: true, initial: "" }),
      cls:      new fields.StringField({ required: true, blank: true, initial: "" }),
      weapon:   new fields.StringField({ required: true, blank: true, initial: "" }),
      ac:       new fields.NumberField({ required: true, integer: true, min: 2, max: 8, initial: 4 }),
      quote:    new fields.StringField({ required: true, blank: true, initial: "" }),
      notes:    new fields.HTMLField({ required: true, blank: true, initial: "" })
    };
  }

  /** Clé utilisée pour lire le coût en emplacements dans les réglages. */
  get slotKey() { return "grunt"; }
}

export class THWCharacterData extends THWActorBase {
  static defineSchema() {
    return Object.assign(super.defineSchema(), {
      role: new fields.StringField({
        required: true, blank: false, initial: "grunt",
        choices: { leader: "leader", grunt: "grunt", creature: "creature" }
      })
    });
  }

  /** Le rôle « custom » a été retiré en 1.3.0 : les acteurs concernés deviennent des Grunts. */
  static migrateData(source) {
    if (source.role === "custom") source.role = "grunt";
    return super.migrateData(source);
  }

  get slotKey() { return this.role; }
}
