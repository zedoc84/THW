import { THW, filePicker } from "../config.mjs";

const { HandlebarsApplicationMixin } = foundry.applications.api;
const { ItemSheetV2 } = foundry.applications.sheets;

/** Socle commun aux fiches d'Objet : gestion de l'image et contexte de base. */
class THWBaseItemSheet extends HandlebarsApplicationMixin(ItemSheetV2) {
  static DEFAULT_OPTIONS = {
    classes: ["thw", "sheet", "item"],
    position: { width: 540, height: 560 },
    window: { resizable: true },
    form: { submitOnChange: true, closeOnSubmit: false },
    actions: {
      editImage: THWBaseItemSheet.#onEditImage,
      resetImage: THWBaseItemSheet.#onResetImage
    }
  };

  async _prepareContext(opts) {
    const ctx = await super._prepareContext(opts);
    ctx.system = this.document.system;
    ctx.editable = this.isEditable;
    return ctx;
  }

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

  static async #onResetImage(event, target) {
    if (!this.isEditable) return;
    const attr = target.dataset.edit || "img";
    const fallback = THW.defaultImages[this.document.type] ?? "icons/svg/item-bag.svg";
    await this.document.update({ [attr]: fallback });
  }
}

export class THWAttributeSheet extends THWBaseItemSheet {
  static DEFAULT_OPTIONS = { window: { icon: "fa-solid fa-star" } };
  static PARTS = { form: { template: "systems/thw/templates/item/attribute-sheet.hbs" } };
}

export class THWItemSheet extends THWBaseItemSheet {
  static DEFAULT_OPTIONS = { window: { icon: "fa-solid fa-sack-xmark" } };
  static PARTS = { form: { template: "systems/thw/templates/item/item-sheet.hbs" } };
}
