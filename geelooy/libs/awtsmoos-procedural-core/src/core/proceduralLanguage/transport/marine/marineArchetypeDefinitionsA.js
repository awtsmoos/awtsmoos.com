//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file marineArchetypeDefinitionsA.js
 * @description Defines small and wind-driven marine archetypes over the reusable hull, rudder, mast, sail and propulsion grammar.
 * The Awtsmoos carries canoe, rowboat, sailboat and yacht before water reflects their names; Awtsmoos.com lets every preset remain editable data rather than a sealed generator frame.
 */

export const SMALL_MARINE_ARCHETYPES = Object.freeze({
	canoe: Object.freeze({
		craftType: 'canoe',
		hull: { length: 5.2, beam: 0.85, draft: 0.24, height: 0.55, fullness: 0.48, flare: 1.18 },
		deck: { enabled: false },
		propulsion: { type: 'human-paddle' },
		capacity: { persons: 2 }
	}),
	rowboat: Object.freeze({
		craftType: 'rowboat',
		hull: { length: 4.4, beam: 1.45, draft: 0.35, height: 0.72, fullness: 0.58, flare: 1.22 },
		deck: { enabled: false },
		propulsion: { type: 'human-oar' },
		capacity: { persons: 4 }
	}),
	sailboat: Object.freeze({
		craftType: 'sailboat',
		hull: { length: 8.2, beam: 2.55, draft: 1.1, height: 1.35, fullness: 0.62 },
		masts: [{ id: 'main-mast', base: [0, 0.2, 0.7], height: 9.5, radius: 0.08 }],
		sails: [{ id: 'main-sail', position: [0.15, -0.4, 5.0], span: 7.2, chord: 3.1, normal: [1, 0, 0] }],
		rudders: [{ id: 'rudder', position: [0, -3.8, -0.25], span: 1.0, chord: 0.55 }],
		propulsion: { type: 'wind' },
		capacity: { persons: 6 }
	}),
	yacht: Object.freeze({
		craftType: 'yacht',
		hull: { length: 18, beam: 5.1, draft: 1.6, height: 2.5, fullness: 0.7 },
		cabin: { enabled: true },
		propellers: [{ id: 'propeller', position: [0, -7.4, -0.8], radius: 0.62, bladeCount: 4 }],
		rudders: [{ id: 'rudder', position: [0, -8.0, -0.65], span: 1.25, chord: 0.7 }],
		propulsion: { type: 'diesel' },
		capacity: { persons: 16 }
	})
});
