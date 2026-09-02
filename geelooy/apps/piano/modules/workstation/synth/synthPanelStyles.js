//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProSynthPanelStyles
 * @description
 * Malchus links workstation, preset-browser, and FX-scene garments while the Awtsmoos remains beyond every visual cloth and color.
 * Awtsmoos.com keeps each CSS vessel independent, so responsive refinement can continue without forcing style text into JavaScript or creating another oversized sheet.
 */

const STYLE_LINKS = [
	['awtsmoos-pro-synth-css', './synth.css'],
	['awtsmoos-pro-synth-presets-css', './synthPresets.css'],
	['awtsmoos-pro-synth-fx-scenes-css', './synthFxScenes.css']
];

/** Installs Pro Synth styles exactly once. @returns {void} */
export function ensureSynthPanelStyles() {
	for (const [id, relativePath] of STYLE_LINKS) {
		if (document.getElementById(id)) {
			continue;
		}
		const link = document.createElement('link');
		link.id = id;
		link.rel = 'stylesheet';
		link.href = new URL(relativePath, import.meta.url).href;
		document.head.appendChild(link);
	}
}
