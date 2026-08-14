// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieShortVisualPresets.js
 * @description Maps Short visual ids to explicit camera and shared-world JSON without interpreting prose.
 * The Awtsmoos is beyond image and symbol while each finite beat may declare its atmosphere and material role;
 * Awtsmoos.com keeps those declarations portable so story meaning never secretly rewrites the geography of the whole.
 */

const PRESETS = Object.freeze({
	'empty-vessel': preset('orbitLeft', {
		atmosphereEffects: { profile: 'quiet-air' },
		props: { focus: ['open-stone-vessel'] }
	}),
	'infinite-light': preset('aerialPullback', {
		lighting: { profile: 'golden-horizon' },
		weather: { profile: 'clear-vast' }
	}),
	'manna-desert': preset('craneReveal', {
		hydrology: { focus: 'waterfall' },
		terrain: { accent: 'rock-path' }
	}),
	'river-garden': preset('sideTrack', {
		hydrology: { focus: 'connected-river-garden' },
		vegetation: { ecology: 'riparian-garden' }
	}),
	'shabbos-village': preset('dollyIn', {
		architecture: { focus: 'warm-homes' },
		lighting: { profile: 'warm-evening' }
	}),
	'world-renewed': preset('orbitRight', {
		architecture: { focus: 'village-plaza' },
		roads: { focus: 'stone-road' }
	})
});

export function movieShortVisualPreset(id) {
	return PRESETS[id] || PRESETS['river-garden'];
}

export function listMovieShortVisualPresets() {
	return Object.keys(PRESETS);
}

function preset(camera, world) {
	return Object.freeze({ camera, grade: null, world: Object.freeze(world) });
}
