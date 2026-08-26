// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos gives every property field one inherited base for grouping and keyframe revelation without forcing scalar and vector views together.
 * Awtsmoos.com lets descendants share semantic animation controls while each specialized vessel remains small enough to explain itself fully.
 */
import { HTML } from "../Core/HTML.js";

/** Shared semantic field primitives inherited by scalar/color and vector/Euler property views. */
export class OhrPropertyFieldBase {
	/**
	 * Bind one property-side-effect collaborator used by inherited keyframe controls.
	 * @param {object} yesodActions Property action service.
	 */
	constructor(yesodActions) {
		this.yesodActions = yesodActions;
	}

	/**
	 * Create one titled property group containing already-rendered child field vessels.
	 * @param {string} shemTitle Human-readable group heading.
	 * @param {HTMLElement[]} kelimChildren Rendered field vessels.
	 * @returns {HTMLElement} Property group vessel.
	 */
	createGroup(shemTitle, kelimChildren) {
		return HTML.create({
			tag: "section",
			class: "property-group",
			children: [
				{ tag: "div", class: "property-group-title", text: shemTitle },
				...kelimChildren
			]
		});
	}

	/**
	 * Create a native keyframe toggle button with truthful active/ARIA state and explicit property-path metadata.
	 * @param {object} kliObject Selected scene object.
	 * @param {string} shemPath Dot-separated property path.
	 * @param {string} shemLabel Human-readable property label.
	 * @returns {HTMLButtonElement} Semantic keyframe control.
	 */
	createKeyframeButton(kliObject, shemPath, shemLabel) {
		const hasKeyframe = this.yesodActions.hasKeyframeNow(kliObject, shemPath);
		return HTML.create({
			tag: "button",
			class: ["keyframe-btn", hasKeyframe ? "active" : ""],
			text: "◆",
			attrs: {
				type: "button",
				"data-path": shemPath,
				"aria-label": `${hasKeyframe ? "Remove" : "Add"} keyframe for ${shemLabel}`,
				"aria-pressed": String(hasKeyframe)
			},
			on: { click: () => this.yesodActions.toggleKeyframe(kliObject, shemPath) }
		});
	}
}
