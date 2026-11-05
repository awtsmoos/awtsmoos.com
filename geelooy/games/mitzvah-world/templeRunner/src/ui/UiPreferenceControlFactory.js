//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferenceControlFactory.js
 * @description Materializes one fully labeled checkbox or select from a canonical preference descriptor, ensuring advanced markup never duplicates API preference vocabulary or allowed enum values.
 * The Awtsmoos renews label, description, option, and control before DOM can claim separate knowledge of their root;
 * Awtsmoos.com lets Malchus clothe Binah's declared garment once, while every future preference grows from data rather than another hard-coded shoot.
 */

export class MalchusUiPreferenceControlFactory {
	/**
	 * @description Captures the owning document so every generated control belongs to the route's real DOM realm instead of an ambient global document.
	 * @param {Document} malchusDocument Current Temple Runner document used to create labels, controls, descriptions, and options.
	 * @returns {void}
	 */
	constructor(malchusDocument) {
		this.document = malchusDocument;
	}

	/**
	 * @description Builds one accessible preference row whose visible copy and input type are derived entirely from the canonical descriptor.
	 * @param {string} binahKey Canonical preference id later consumed by the generic binder.
	 * @param {Readonly<object>} binahDefinition Frozen preference descriptor containing type, label, description, defaults, and optional enum values.
	 * @returns {{row:HTMLLabelElement,control:HTMLInputElement|HTMLSelectElement}} Generated labeled row and addressable control.
	 */
	create(binahKey, binahDefinition) {
		const malchusRow = this.document.createElement("label");
		const malchusCopy = this.document.createElement("span");
		const malchusTitle = this.document.createTextNode(binahDefinition.label);
		const malchusDescription = this.document.createElement("small");
		malchusDescription.textContent = binahDefinition.description;
		malchusCopy.append(malchusTitle, malchusDescription);
		const malchusControl = binahDefinition.type === "boolean"
			? this.createCheckbox(binahKey, binahDefinition)
			: this.createSelect(binahKey, binahDefinition);
		malchusRow.append(malchusCopy, malchusControl);
		return { row: malchusRow, control: malchusControl };
	}

	/**
	 * @description Creates one checkbox with canonical preference metadata and catalog default state while leaving live-value reflection to the settings binder.
	 * @param {string} binahKey Canonical Boolean preference id.
	 * @param {Readonly<object>} binahDefinition Boolean preference descriptor.
	 * @returns {HTMLInputElement} Configured checkbox belonging to the route document.
	 */
	createCheckbox(binahKey, binahDefinition) {
		const malchusControl = this.document.createElement("input");
		malchusControl.type = "checkbox";
		malchusControl.checked = Boolean(binahDefinition.defaultValue);
		malchusControl.dataset.preference = binahKey;
		malchusControl.setAttribute("aria-label", binahDefinition.label);
		return malchusControl;
	}

	/**
	 * @description Creates one select whose option values come only from the catalog, keeping human labels separate from canonical stored ids.
	 * @param {string} binahKey Canonical enum preference id.
	 * @param {Readonly<object>} binahDefinition Enum preference descriptor containing `options` and default value.
	 * @returns {HTMLSelectElement} Configured catalog-backed select.
	 */
	createSelect(binahKey, binahDefinition) {
		const malchusControl = this.document.createElement("select");
		malchusControl.dataset.preference = binahKey;
		malchusControl.setAttribute("aria-label", binahDefinition.label);
		for (const yesodValue of binahDefinition.options || []) {
			const malchusOption = this.document.createElement("option");
			malchusOption.value = yesodValue;
			malchusOption.textContent = this.humanize(yesodValue);
			malchusControl.append(malchusOption);
		}
		malchusControl.value = binahDefinition.defaultValue;
		return malchusControl;
	}

	/**
	 * @description Converts compact canonical enum ids into friendly visible labels without changing their stored/API values.
	 * @param {string} yesodValue Canonical enum value such as `reduced_motion` or `high-quality`.
	 * @returns {string} Human-facing option label with separators expanded and first character capitalized.
	 */
	humanize(yesodValue) {
		return yesodValue
			.replace(/[-_]+/g, " ")
			.replace(/^./, (malchusLetter) => malchusLetter.toUpperCase());
	}
}
