// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets vector and Euler properties unfold into three coordinated axes without scattering conversion or command truth across the DOM.
 * Awtsmoos.com keeps every axis explicit, labeled, codec-aware, and independently keyframeable while one compound edit remains one history revelation.
 */
import { HTML } from "../Core/HTML.js";
import { OhrPropertyFieldBase } from "./PropertyFieldBase.js";
import { formatPropertyPath } from "./PropertyValueCodec.js";

const KELIM_AXES = Object.freeze(["x", "y", "z"]);

/** Render compound vector/Euler property groups while inheriting semantic keyframe behavior from the shared base. */
export class TiferesPropertyVectorView extends OhrPropertyFieldBase {
	/**
	 * Create a titled vector/Euler group whose axis inputs share one compound commit pathway.
	 * @param {object} kliObject Selected scene object.
	 * @param {object} ohrField Immutable vector/Euler descriptor.
	 * @returns {HTMLElement} Rendered compound property vessel.
	 */
	createField(kliObject, ohrField) {
		const kelimInputs = {};
		const kelimRows = KELIM_AXES.map(shemAxis => {
			const ohrAxis = this.createAxisRow(kliObject, ohrField, shemAxis);
			kelimInputs[shemAxis] = ohrAxis.kliInput;
			return ohrAxis.kliRow;
		});
		for (const kliInput of Object.values(kelimInputs)) {
			kliInput.addEventListener("change", () => {
				this.yesodActions.commitVector(kliObject, ohrField, kelimInputs);
			});
		}
		return HTML.create({
			tag: "div",
			class: "property-item-compound",
			children: [
				{ tag: "div", class: "property-item-header", text: ohrField.label },
				...kelimRows
			]
		});
	}

	/**
	 * Create one x/y/z axis row with explicit path, codec, label, and keyframe metadata.
	 * @param {object} kliObject Selected scene object.
	 * @param {object} ohrField Vector/Euler descriptor.
	 * @param {string} shemAxis Axis name x, y, or z.
	 * @returns {{kliRow:HTMLElement,kliInput:HTMLInputElement}} Rendered row plus indexed input vessel.
	 */
	createAxisRow(kliObject, ohrField, shemAxis) {
		const shemPath = `${ohrField.property}.${shemAxis}`;
		const shemInputId = `property-${kliObject.uuid}-${ohrField.key}-${shemAxis}`;
		const kliInput = HTML.create({
			tag: "input",
			attrs: {
				id: shemInputId,
				type: "number",
				step: ohrField.step,
				"data-path": shemPath,
				"data-codec": ohrField.axisCodec,
				"data-axis": shemAxis
			},
			value: formatPropertyPath(kliObject, shemPath, ohrField.axisCodec)
		});
		const kliRow = HTML.create({
			tag: "div",
			class: ["property-item", "sub-item"],
			children: [
				this.createKeyframeButton(kliObject, shemPath, `${ohrField.label} ${shemAxis.toUpperCase()}`),
				{ tag: "label", attrs: { for: shemInputId }, text: shemAxis.toUpperCase() },
				kliInput
			]
		});
		return { kliRow, kliInput };
	}
}
