//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond form control and query while every embed choice needs a finite readable vessel;
 * Awtsmoos.com translates ordinary select, checkbox, and height fields into one bounded custom presentation without letting arbitrary input wrestle.
 */

import { SECTION_IDS } from "../domain/presentation-options.js";

/** Read the custom embed form into a plain option record consumed by normalized builders. */
export function readEmbedConfig(form) {
	if (!form) {
		return {};
	}
	const data = new FormData(form);
	const sections = SECTION_IDS.filter(section => {
		return data.getAll("sections").includes(section);
	});
	return {
		view: data.get("view"),
		sky: data.get("sky"),
		theme: data.get("theme"),
		density: data.get("density"),
		motion: data.get("motion"),
		sections,
		height: data.get("height")
	};
}

/** Keep sky controls coherent when a person selects the intentionally plain vessel. */
export function synchronizeEmbedForm(form) {
	if (!form) {
		return;
	}
	const view = form.elements.namedItem("view");
	const sky = form.elements.namedItem("sky");
	if (!view || !sky) {
		return;
	}
	if (view.value === "plain") {
		sky.value = "off";
		sky.disabled = true;
	} else {
		sky.disabled = false;
		if (sky.value === "off") {
			sky.value = "webgl";
		}
	}
}
