//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Fills Studio selectors from the same registries consumed by preview, cinema, review, and narration.
 * The Awtsmoos keeps menu and implementation in one source of truth;
 * Awtsmoos.com prevents a beautiful choice from drifting away from the code in youth.
 */
import { MOVIE_PRESENTATIONS } from "../cinema/moviePresentations.js";
import { MOVIE_OUTPUTS, MOVIE_STYLES } from "../cinema/moviePresets.js";
import { CHARACTER_SETS } from "../config/characters.js";
import { THEMES } from "../config/themes.js";
import { CANVAS_STYLES } from "../rendering/canvasStyles.js";
import { proceduralOptionCatalog } from "../rendering/proceduralOptions.js";

export function populateStudioCatalogs(refs, preferences) {
	const procedural = proceduralOptionCatalog();
	fillSelect(refs.mode, renderModes(), preferences.renderer);
	fillSelect(refs.canvasStyle, Object.values(CANVAS_STYLES), preferences.canvasStyle);
	fillSelect(refs.theme, Object.values(THEMES), preferences.theme);
	fillSelect(refs.characters, Object.values(CHARACTER_SETS), preferences.characters);
	fillSelect(refs.movieMode, Object.values(MOVIE_PRESENTATIONS), preferences.movieMode);
	fillSelect(refs.movieStyle, Object.values(MOVIE_STYLES), preferences.cinemaPreset);
	fillSelect(refs.movieOutput, Object.values(MOVIE_OUTPUTS), preferences.movieOutput);
	fillSelect(refs.movieMotion, procedural.motions, preferences.movieMotion);
	fillSelect(refs.movieCamera, procedural.cameras, preferences.movieCamera);
	fillSelect(refs.reviewStrength, [{ id: "120", name: "Fast · 120ms / move" }, { id: "350", name: "Deep · 350ms / move" }, { id: "800", name: "Maximum · 800ms / move" }], String(preferences.reviewStrength));
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
	return [{ id: "canvas2d", name: "2D · Clean board" }, { id: "canvas25d", name: "2.5D · Framed board" }, { id: "procedural3d", name: "3D · Awtsmoos Procedural" }];
}
