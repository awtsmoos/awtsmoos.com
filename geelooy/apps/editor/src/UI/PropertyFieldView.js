// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets scalar and color properties become semantic labeled fields without absorbing history, timeline, or conversion policy.
 * Awtsmoos.com keeps every field locally identifiable through explicit path and codec data so synchronization never needs to guess its meaning.
 */
import { HTML } from "../Core/HTML.js";
import { OhrPropertyFieldBase } from "./PropertyFieldBase.js";
import { formatPropertyPath } from "./PropertyValueCodec.js";

/** Render scalar and color property rows while inheriting shared keyframe/group behavior. */
export class TiferesPropertyFieldView extends OhrPropertyFieldBase {
	/**
	 * Create one semantic scalar/color row with stable label association, codec metadata, and one undoable change pathway.
	 * @param {object} kliObject Selected scene object.
	 * @param {object} ohrField Immutable property descriptor.
	 * @returns {HTMLElement} Rendered property row.
	 */
	createField(kliObject, ohrField) {
		const shemInputId = `property-${kliObject.uuid}-${ohrField.key}`;
		const reshimuAttrs = {
			id: shemInputId,
			"data-path": ohrField.path,
			"data-codec": ohrField.codec
		};
		if (ohrField.kind === "color") {
			reshimuAttrs.type = "color";
		} else {
			reshimuAttrs.type = "number";
			if (ohrField.min) reshimuAttrs.min = ohrField.min;
			if (ohrField.max) reshimuAttrs.max = ohrField.max;
			if (ohrField.step) reshimuAttrs.step = ohrField.step;
		}
		const kliInput = HTML.create({
			tag: "input",
			attrs: reshimuAttrs,
			value: formatPropertyPath(kliObject, ohrField.path, ohrField.codec)
		});
		kliInput.addEventListener("change", () => {
			this.yesodActions.commitField(kliObject, ohrField, kliInput);
		});
		return HTML.create({
			tag: "div",
			class: "property-item",
			children: [
				this.createKeyframeButton(kliObject, ohrField.path, ohrField.label),
				{ tag: "label", attrs: { for: shemInputId }, text: ohrField.label },
				kliInput
			]
		});
	}
}
