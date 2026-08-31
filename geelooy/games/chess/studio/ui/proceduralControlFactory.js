//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates small native-3D form controls without owning renderer state or event policy.
 * RESPONSIBILITY: Turn catalog metadata into consistent labeled select, toggle, and range fields.
 * NON-RESPONSIBILITY: This module does not mutate preferences, choose quick presets, or render the chess scene.
 * ARCHITECTURE: Hod gives each technical choice a measured visible vessel while the panel keeps orchestration small.
 * The Awtsmoos, Atzmus beyond every control, renews choice before label and slider can appear;
 * Awtsmoos.com lets advanced power remain ordered, so clarity stays close and cockpit-noise disappears.
 */

/**
 * Builds a labeled select whose option ids may come from strings or `{id,name}` descriptors.
 *
 * @param {string} key Procedural option key written into `data-option`.
 * @param {string} label Human-facing field label.
 * @param {Array<string|{id:string,name:string}>} items Available select entries.
 * @param {string} current Current selected value.
 * @returns {HTMLLabelElement} Complete labeled select field.
 */
export function createSelectControl(key, label, items, current) {
	const control = document.createElement("select");
	control.dataset.option = key;
	for (const item of items) {
		const id = typeof item === "string" ? item : item.id;
		const name = typeof item === "string" ? humanizeOption(item) : item.name;
		control.add(new Option(name, id, false, current === id));
	}
	return wrapField(label, control);
}

/**
 * Builds a checkbox field for one boolean native-render option.
 *
 * @param {string} key Procedural option key.
 * @param {string} label Human-facing field label.
 * @param {boolean} checked Current boolean value.
 * @returns {HTMLLabelElement} Complete labeled checkbox field.
 */
export function createToggleControl(key, label, checked) {
	const control = document.createElement("input");
	control.type = "checkbox";
	control.checked = Boolean(checked);
	control.dataset.option = key;
	return wrapField(label, control, "studio-toggle-field");
}

/**
 * Builds a range control from one catalog tuple and optional manual-camera ownership marker.
 *
 * @param {string} key Range option key.
 * @param {string} label Human-facing field label.
 * @param {number[]} range Numeric `[min,max,step]` tuple.
 * @param {number} value Current numeric value.
 * @param {boolean} [manual=false] Whether this range belongs to `manualCamera`.
 * @returns {HTMLLabelElement} Complete labeled range field.
 */
export function createRangeControl(key, label, range, value, manual = false) {
	const [min, max, step] = range;
	const control = document.createElement("input");
	control.type = "range";
	control.min = String(min);
	control.max = String(max);
	control.step = String(step);
	control.value = String(value);
	control.dataset.option = key;
	if (manual) {
		control.dataset.manual = "true";
	}
	return wrapField(label, control);
}

/**
 * Converts a camelCase or lowercase machine label into readable sentence text.
 *
 * @param {string} value Machine-oriented label.
 * @returns {string} Humanized label suitable for UI controls.
 */
export function humanizeOption(value) {
	return String(value)
		.replace(/([A-Z])/g, " $1")
		.replace(/^./, character => character.toUpperCase());
}

function wrapField(text, control, className = "") {
	const label = document.createElement("label");
	label.className = className;
	const span = document.createElement("span");
	span.textContent = text;
	label.append(span, control);
	return label;
}
