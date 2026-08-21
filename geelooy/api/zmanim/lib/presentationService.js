//B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos is beyond client and server while finite presentation names remain one shared covenant;
 * Awtsmoos.com loads browser vocabulary and presets here so API metadata, comparison, and static embeds never drift into another heaven.
 */

const {
	loadEmbedPresets,
	loadPresentation
} = require("./domainLoader.js");

/** Normalize server query presentation through the exact browser presentation module. */
async function presentationQuery(source = {}) {
	const presentation = await loadPresentation();
	return presentation.normalizePresentationOptions({
		view: source.view,
		sky: source.sky,
		theme: source.theme,
		density: source.density,
		motion: source.motion,
		sections: source.sections
	});
}

/** Expose finite public presentation options, presets, and integration endpoints for external builders. */
async function presentationOptionsPayload() {
	const [presentation, embeds] = await Promise.all([
		loadPresentation(),
		loadEmbedPresets()
	]);
	return {
		BH: "B\"H",
		ok: true,
		presentation: {
			views: [...presentation.VIEW_MODES],
			skies: [...presentation.SKY_MODES],
			themes: [...presentation.THEME_MODES],
			densities: [...presentation.DENSITY_MODES],
			motions: [...presentation.MOTION_MODES],
			sections: [...presentation.SECTION_IDS],
			defaults: presentation.normalizePresentationOptions()
		},
		embeds: {
			presets: serializablePresets(embeds.EMBED_PRESETS),
			interactive: "/zmanim/?embed=custom",
			serverHtml: "/api/zmanim/embed",
			jsonDay: "/api/zmanim/day",
			jsonCompare: "/api/zmanim/compare",
			comparisonQuery: "opinions=all or opinions=id1,id2,...",
			serverSkyNote: "Static server HTML is GPU-free; native celestial rendering belongs to the interactive iframe."
		}
	};
}

/** Copy frozen browser preset records into ordinary JSON-safe response data. */
function serializablePresets(presets) {
	return Object.fromEntries(Object.entries(presets).map(([name, preset]) => {
		return [name, {
			...preset,
			sections: [...preset.sections]
		}];
	}));
}

module.exports = {
	presentationOptionsPayload,
	presentationQuery
};
