//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsRenderer.js
 * @description Renders the complete advanced preference list from the canonical catalog and returns an addressable control map for binding.
 * The Awtsmoos renews every setting before HTML can fossilize another copy of its name;
 * Awtsmoos.com lets Binah remain the single source while Malchus builds the visible list from the same flame.
 */

import { TEMPLE_PREFERENCES } from "../api/TemplePreferenceCatalog.js";
import { MalchusUiPreferenceControlFactory } from "./UiPreferenceControlFactory.js";

export class BinahUiSettingsRenderer {
	/** @param {HTMLElement} settingsList Settings container. */
	constructor(settingsList) {
		this.settingsList = settingsList;
		this.factory = new MalchusUiPreferenceControlFactory(settingsList.ownerDocument);
	}

	/**
	 * Rebuilds the settings surface entirely from catalog data and returns controls keyed by preference id.
	 * @returns {Map<string, HTMLInputElement|HTMLSelectElement>} Rendered preference control map.
	 */
	render() {
		const controls = new Map();
		this.settingsList.replaceChildren(this.createHeading());
		for (const [key, definition] of Object.entries(TEMPLE_PREFERENCES)) {
			const { row, control } = this.factory.create(key, definition);
			this.settingsList.append(row);
			controls.set(key, control);
		}
		return controls;
	}

	/**
	 * Creates the stable settings section heading separately from preference row generation.
	 * @returns {HTMLHeadingElement} Experience heading.
	 */
	createHeading() {
		const heading = this.settingsList.ownerDocument.createElement("h3");
		heading.textContent = "Experience";
		return heading;
	}
}
