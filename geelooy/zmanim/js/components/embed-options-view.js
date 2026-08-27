//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond option and form while every foreign page needs a clear covenant before it receives the measured day;
 * Awtsmoos.com renders finite embed controls as ordinary accessible HTML so developers and readers can see exactly which vessel is on the way.
 */

import { SECTION_IDS } from "../domain/presentation-options.js";

const SECTION_LABELS = Object.freeze({
	next: "Next zman",
	key: "Key times",
	timeline: "Timeline",
	sky: "Celestial sky",
	all: "All zmanim",
	methods: "Methods"
});

/** Build the custom embed option form with only allow-listed finite choices. */
export function renderEmbedOptionsForm() {
	const form = document.createElement("form");
	form.className = "embed-options-form";
	form.innerHTML = `
		<div class="embed-option-grid">
			${selectField("view", "View", [["plain", "Plain HTML"], ["enhanced", "Celestial"]])}
			${selectField("sky", "Sky", [["off", "Off"], ["css", "CSS"], ["webgl", "Native WebGL2"]])}
			${selectField("theme", "Theme", [["system", "System"], ["dark", "Dark"], ["light", "Light"]])}
			${selectField("density", "Density", [["comfortable", "Comfortable"], ["compact", "Compact"]])}
			${selectField("motion", "Motion", [["auto", "Auto"], ["reduced", "Reduced"], ["off", "Off"]])}
			<label class="embed-field"><span>Height</span><input name="height" type="number" min="280" max="1400" step="20" value="560"></label>
		</div>
		<fieldset class="embed-sections">
			<legend>Sections</legend>
			<div class="embed-section-grid"></div>
		</fieldset>
		<div class="embed-custom-actions">
			<button type="button" data-embed-copy="interactive">Copy interactive iframe</button>
			<button type="button" data-embed-copy="server">Copy server HTML iframe</button>
			<button type="button" data-embed-copy="api">Copy JSON API URL</button>
		</div>`;
	const sectionGrid = form.querySelector(".embed-section-grid");
	for (const section of SECTION_IDS) {
		sectionGrid.append(renderSectionOption(section));
	}
	return form;
}

/** Create one static select field from trusted option tuples. */
function selectField(name, label, options) {
	const choices = options.map(([value, text]) => {
		return `<option value="${value}">${text}</option>`;
	}).join("");
	return `<label class="embed-field"><span>${label}</span><select name="${name}">${choices}</select></label>`;
}

/** Create one section checkbox with a generous ordinary label target. */
function renderSectionOption(section) {
	const label = document.createElement("label");
	label.className = "embed-section-option";
	const checkbox = document.createElement("input");
	checkbox.type = "checkbox";
	checkbox.name = "sections";
	checkbox.value = section;
	checkbox.checked = ["next", "key", "all"].includes(section);
	const text = document.createElement("span");
	text.textContent = SECTION_LABELS[section];
	label.append(checkbox, text);
	return label;
}
