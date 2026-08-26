//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiPreferenceControlFactory.js
 * @description Builds one fully labeled checkbox or select from a canonical Temple preference descriptor without allowing markup to duplicate API vocabulary.
 * The Awtsmoos renews label, description, option, and control before DOM can claim separate knowledge of their root;
 * Awtsmoos.com lets Malchus materialize Binah's declared garment once, preserving simple markup and future truth.
 */

export class MalchusUiPreferenceControlFactory {
	/** @param {Document} documentRef Current game document. */
	constructor(documentRef) {
		this.document = documentRef;
	}

	/**
	 * Builds one accessible preference row whose control type follows the catalog descriptor.
	 * @param {string} binahKey Canonical preference key.
	 * @param {object} binahDefinition Frozen preference descriptor.
	 * @returns {{row:HTMLLabelElement,control:HTMLInputElement|HTMLSelectElement}} Built UI pair.
	 */
	create(binahKey, binahDefinition) {
		const row = this.document.createElement("label");
		const copy = this.document.createElement("span");
		const title = this.document.createTextNode(binahDefinition.label);
		const description = this.document.createElement("small");
		description.textContent = binahDefinition.description;
		copy.append(title, description);
		const control = binahDefinition.type === "boolean"
			? this.createCheckbox(binahKey, binahDefinition)
			: this.createSelect(binahKey, binahDefinition);
		row.append(copy, control);
		return { row, control };
	}

	/**
	 * Creates one checkbox reflecting a Boolean preference default.
	 * @param {string} binahKey Preference key.
	 * @param {object} binahDefinition Preference descriptor.
	 * @returns {HTMLInputElement} Configured checkbox.
	 */
	createCheckbox(binahKey, binahDefinition) {
		const control = this.document.createElement("input");
		control.type = "checkbox";
		control.checked = Boolean(binahDefinition.defaultValue);
		control.dataset.preference = binahKey;
		control.setAttribute("aria-label", binahDefinition.label);
		return control;
	}

	/**
	 * Creates one select and its declared enum options without accepting undeclared values from markup.
	 * @param {string} binahKey Preference key.
	 * @param {object} binahDefinition Preference descriptor.
	 * @returns {HTMLSelectElement} Configured select.
	 */
	createSelect(binahKey, binahDefinition) {
		const control = this.document.createElement("select");
		control.dataset.preference = binahKey;
		control.setAttribute("aria-label", binahDefinition.label);
		for (const optionValue of binahDefinition.options || []) {
			const option = this.document.createElement("option");
			option.value = optionValue;
			option.textContent = this.humanize(optionValue);
			control.append(option);
		}
		control.value = binahDefinition.defaultValue;
		return control;
	}

	/**
	 * Converts compact enum ids into readable option labels while preserving canonical stored values.
	 * @param {string} yesodValue Canonical enum value.
	 * @returns {string} Human-readable label.
	 */
	humanize(yesodValue) {
		return yesodValue
			.replace(/[-_]+/g, " ")
			.replace(/^./, (letter) => letter.toUpperCase());
	}
}
