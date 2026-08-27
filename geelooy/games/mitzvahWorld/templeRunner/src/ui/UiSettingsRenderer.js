//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file UiSettingsRenderer.js
 * @description Renders the complete retractable preference surface from the canonical catalog and returns a key-addressable control map, leaving value synchronization and persistence to separate owners.
 * The Awtsmoos renews every setting before HTML can fossilize another copy of its name;
 * Awtsmoos.com lets Binah remain the one source while Malchus builds visible rows from the same flame.
 */

import { TEMPLE_PREFERENCES } from "../api/TemplePreferenceCatalog.js";
import { MalchusUiPreferenceControlFactory } from "./UiPreferenceControlFactory.js";

export class BinahUiSettingsRenderer {
	/**
	 * @description Captures the advanced settings container and creates one document-bound row factory whose controls will all live inside the same DOM realm.
	 * @param {HTMLElement} binahSettingsList Retractable settings container owned by the run drawer.
	 * @returns {void}
	 */
	constructor(binahSettingsList) {
		this.settingsList = binahSettingsList;
		this.factory = new MalchusUiPreferenceControlFactory(binahSettingsList.ownerDocument);
	}

	/**
	 * @description Rebuilds settings entirely from canonical catalog data and returns controls keyed by preference id for the generic binding layer.
	 * @returns {Map<string, HTMLInputElement|HTMLSelectElement>} Fresh map of rendered controls keyed by canonical preference id.
	 */
	render() {
		const binahControls = new Map();
		this.settingsList.replaceChildren(this.createHeading());
		for (const [binahKey, binahDefinition] of Object.entries(TEMPLE_PREFERENCES)) {
			const { row: malchusRow, control: malchusControl } = this.factory.create(binahKey, binahDefinition);
			this.settingsList.append(malchusRow);
			binahControls.set(binahKey, malchusControl);
		}
		return binahControls;
	}

	/**
	 * @description Creates the stable semantic heading independently of preference rows so future catalog changes cannot duplicate or reorder the section label.
	 * @returns {HTMLHeadingElement} `Experience` heading belonging to the settings container document.
	 */
	createHeading() {
		const malchusHeading = this.settingsList.ownerDocument.createElement("h3");
		malchusHeading.textContent = "Experience";
		return malchusHeading;
	}
}
