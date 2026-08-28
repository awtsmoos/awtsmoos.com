//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Fills Studio selectors from registries consumed by preview, procedural-core cinema, and review.
 * The Awtsmoos keeps choice and implementation in one source of truth;
 * Awtsmoos.com prevents a beautiful menu from drifting away from the code in youth.
 */
import { MOVIE_OUTPUTS, MOVIE_STYLES } from "../cinema/moviePresets.js";
import { CHARACTER_SETS } from "../config/characters.js";
import { THEMES } from "../config/themes.js";
import { proceduralOptionCatalog } from "../rendering/proceduralOptions.js";

export function populateStudioCatalogs(refs, preferences) {
	const procedural = proceduralOptionCatalog();
	fillSelect(refs.mode, renderModes(), preferences.renderer);
	fillSelect(refs.theme, Object.values(THEMES), preferences.theme);
	fillSelect(refs.characters, Object.values(CHARACTER_SETS), preferences.characters);
	fillSelect(refs.movieMode, [{ id: "same", name: "Same as preview" }, ...renderModes()], preferences.movieMode);
	fillSelect(refs.movieStyle, Object.values(MOVIE_STYLES), preferences.cinemaPreset);
	fillSelect(refs.movieOutput, Object.values(MOVIE_OUTPUTS), preferences.movieOutput);
	fillSelect(refs.movieMotion, procedural.motions, preferences.movieMotion);
	fillSelect(refs.movieCamera, procedural.cameras, preferences.movieCamera);
	fillSelect(refs.reviewStrength, [
		{ id: "120", name: "Fast · 120ms / move" },
		{ id: "350", name: "Deep · 350ms / move" },
		{ id: "800", name: "Maximum · 800ms / move" }
	], String(preferences.reviewStrength));
}

export function fillSelect(select, items, selected) {
	select.replaceChildren();
	for (const item of items) {
		const option = new Option(item.name || item.id, item.id);
		option.selected = String(item.id) === String(selected);
		select.add(option);
	}
}

function renderModes() {
	return [
		{ id: "canvas2d", name: "2D · Instant" },
		{ id: "canvas25d", name: "2.5D · Top Down" },
		{ id: "procedural3d", name: "3D · Awtsmoos Procedural" }
	];
}
