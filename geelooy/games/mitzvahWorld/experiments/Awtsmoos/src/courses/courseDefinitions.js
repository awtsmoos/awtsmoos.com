// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file courseDefinitions.js
 * @description The three built-in Mitzvah World obstacle courses, authored
 * against the real physics envelope (walk 4.2 m/s, run 7.2 m/s, jump height
 * ~2.0m, run-jump distance ~6.3m, step-up limit 0.55m). Facing 0 = +Z, so
 * every course runs toward +Z from its start pad.
 * The Awtsmoos sets three paths: a dash, a river, and a climb to the canopy.
 */

export const COURSE_DEFINITIONS = Object.freeze([
	Object.freeze({
		schema: 'mitzvah-world.course/1',
		id: 'meadow-dash',
		name: 'Meadow Dash',
		difficulty: 'easy',
		description: 'Sprint and hop across the meadow — mind the ice patch.',
		parSeconds: 75,
		spawn: { x: 0, y: 0, z: 2994, facing: 0 },
		killY: -8,
		region: { minX: -40, maxX: 40, minZ: 2985, maxZ: 3110 },
		checkpoints: Object.freeze([
			{ x: 0, z: 3049, y: 1.0, radius: 3.5 },
			{ x: 0, z: 3072, y: 2.0, radius: 3.5 }
		]),
		finish: { x: 0, z: 3089, y: 2.0, radius: 4 },
		platforms: Object.freeze([
			{ x: 0, z: 2994, top: 0, w: 10, d: 10, surface: 'grass' },
			{ x: 0, z: 3005, top: 0, w: 6, d: 6, surface: 'grass' },
			{ x: 0, z: 3013, top: 0, w: 6, d: 6, surface: 'grass' },
			{ x: 3, z: 3021, top: 0.5, w: 5, d: 5, surface: 'stone' },
			{ x: -3, z: 3029, top: 1.0, w: 5, d: 5, surface: 'grass' },
			{ x: 0, z: 3039, top: 1.0, w: 8, d: 8, surface: 'ice' },
			{ x: 0, z: 3049, top: 1.0, w: 6, d: 6, surface: 'grass' },
			{ x: 2, z: 3057, top: 1.5, w: 6, d: 6, surface: 'wood' },
			{ x: -2, z: 3064, top: 2.0, w: 6, d: 6, surface: 'wood' },
			{ x: 0, z: 3072, top: 2.0, w: 6, d: 6, surface: 'grass' },
			{ x: 0, z: 3080, top: 2.0, w: 5, d: 5, surface: 'stone' },
			{ x: 0, z: 3089, top: 2.0, w: 8, d: 8, surface: 'grass' }
		]),
		movers: Object.freeze([]),
		hazards: Object.freeze([]),
		coins: Object.freeze([
			{ x: 0, y: 1.6, z: 3005 },
			{ x: 0, y: 2.6, z: 3039 },
			{ x: -2, y: 3.6, z: 3064 },
			{ x: 0, y: 3.6, z: 3080 }
		])
	}),
	Object.freeze({
		schema: 'mitzvah-world.course/1',
		id: 'river-gap',
		name: 'River Gap',
		difficulty: 'medium',
		description: 'Ride moving platforms across the river — do not fall in.',
		parSeconds: 120,
		spawn: { x: 600, y: 0, z: 2994, facing: 0 },
		killY: -4,
		region: { minX: 560, maxX: 640, minZ: 2985, maxZ: 3110 },
		checkpoints: Object.freeze([
			{ x: 600, z: 3027, y: 0, radius: 3.5 },
			{ x: 600, z: 3055, y: 0, radius: 3.5 },
			{ x: 608, z: 3078, y: 2.5, radius: 3.5 }
		]),
		finish: { x: 608, z: 3087, y: 2.5, radius: 4 },
		platforms: Object.freeze([
			{ x: 600, z: 2994, top: 0, w: 8, d: 8, surface: 'grass' },
			{ x: 600, z: 3005, top: 0, w: 5, d: 5, surface: 'stone' },
			{ x: 600, z: 3027, top: 0, w: 5, d: 5, surface: 'stone' },
			{ x: 600, z: 3055, top: 0, w: 5, d: 5, surface: 'grass' },
			{ x: 608, z: 3063, top: 0, w: 5, d: 5, surface: 'stone' },
			{ x: 608, z: 3078, top: 2.5, w: 5, d: 5, surface: 'grass' },
			{ x: 608, z: 3087, top: 2.5, w: 8, d: 8, surface: 'grass' },
			// The river itself: a visual-only slab the runner must not touch.
			{ x: 600, z: 3045, top: -2, w: 34, d: 120, surface: 'stone', thickness: 0.5, visualOnly: true }
		]),
		movers: Object.freeze([
			{
				id: 'ferry-z', kind: 'sinusoid', axis: 'z',
				base: { x: 600, z: 3014, top: 0 }, w: 4, d: 4,
				amplitude: 4, period: 4.5, phase: 0, surface: 'wood'
			},
			{
				id: 'ferry-loop', kind: 'path',
				path: [[600, 3034, 0], [606, 3040, 0], [600, 3046, 0]],
				w: 4, d: 4, period: 8, phase: 0, surface: 'wood'
			},
			{
				id: 'ferry-x', kind: 'sinusoid', axis: 'x',
				base: { x: 600, z: 3063, top: 0 }, w: 4, d: 4,
				amplitude: 4, period: 4, phase: 0, surface: 'wood'
			},
			{
				id: 'lift', kind: 'sinusoid', axis: 'y',
				base: { x: 608, z: 3071, top: 1.0 }, w: 4, d: 4,
				amplitude: 1.5, period: 3, phase: 0, surface: 'stone'
			}
		]),
		hazards: Object.freeze([]),
		coins: Object.freeze([
			{ x: 600, y: 1.6, z: 3014 },
			{ x: 600, y: 1.6, z: 3055 },
			{ x: 608, y: 4.1, z: 3071 },
			{ x: 608, y: 4.1, z: 3087 }
		])
	}),
	Object.freeze({
		schema: 'mitzvah-world.course/1',
		id: 'canopy-climb',
		name: 'Canopy Climb',
		difficulty: 'hard',
		description: 'Climb the tower, dodge the sweepers, reach the canopy.',
		parSeconds: 180,
		spawn: { x: 1200, y: 0, z: 2994, facing: 0 },
		killY: -8,
		region: { minX: 1160, maxX: 1240, minZ: 2985, maxZ: 3085 },
		checkpoints: Object.freeze([
			{ x: 1200, z: 3015, y: 3.0, radius: 3 },
			{ x: 1200, z: 3033, y: 5.5, radius: 3 },
			{ x: 1196, z: 3056, y: 10.5, radius: 3.5 }
		]),
		finish: { x: 1200, z: 3070, y: 11.5, radius: 4 },
		platforms: Object.freeze([
			{ x: 1200, z: 2994, top: 0, w: 8, d: 8, surface: 'grass' },
			{ x: 1200, z: 3003, top: 1.0, w: 5, d: 5, surface: 'wood' },
			{ x: 1204, z: 3009, top: 2.0, w: 4, d: 4, surface: 'wood' },
			{ x: 1200, z: 3015, top: 3.0, w: 4, d: 4, surface: 'grass' },
			{ x: 1196, z: 3021, top: 4.0, w: 4, d: 4, surface: 'stone' },
			{ x: 1200, z: 3033, top: 5.5, w: 5, d: 5, surface: 'grass' },
			{ x: 1204, z: 3039, top: 6.5, w: 4, d: 4, surface: 'wood' },
			{ x: 1200, z: 3045, top: 7.5, w: 4, d: 4, surface: 'wood' },
			{ x: 1196, z: 3056, top: 10.5, w: 6, d: 6, surface: 'grass' },
			{ x: 1200, z: 3062, top: 11.5, w: 4, d: 4, surface: 'stone' },
			{ x: 1200, z: 3070, top: 11.5, w: 8, d: 8, surface: 'grass' }
		]),
		movers: Object.freeze([
			{
				id: 'sway', kind: 'sinusoid', axis: 'x',
				base: { x: 1200, z: 3027, top: 4.5 }, w: 3, d: 3,
				amplitude: 3, period: 4, phase: 0, surface: 'wood'
			},
			{
				id: 'elevator', kind: 'path',
				path: [[1196, 3050, 7.5], [1196, 3050, 10.5]],
				w: 3, d: 3, period: 5, phase: 0, surface: 'stone'
			}
		]),
		hazards: Object.freeze([
			{
				kind: 'sweeper', center: { x: 1200, y: 4.2, z: 3015 },
				armLength: 3.2, armWidth: 0.9, armHeight: 0.9, period: 2.6, phase: 0
			},
			{
				kind: 'sweeper', center: { x: 1204, y: 7.7, z: 3039 },
				armLength: 3.0, armWidth: 0.9, armHeight: 0.9, period: 2.0, phase: 1
			},
			{
				kind: 'sweeper', center: { x: 1200, y: 12.7, z: 3062 },
				armLength: 3.6, armWidth: 0.9, armHeight: 0.9, period: 1.8, phase: 2
			}
		]),
		coins: Object.freeze([
			{ x: 1200, y: 4.6, z: 3015 },
			{ x: 1204, y: 8.1, z: 3039 },
			{ x: 1196, y: 12.1, z: 3056 },
			{ x: 1200, y: 13.1, z: 3070 }
		])
	})
]);

/** Looks up a course definition by id, or null. */
export function courseDefinitionById(id) {
	return COURSE_DEFINITIONS.find(course => course.id === id) || null;
}

/** The ids accepted by `?course=`. */
export function courseIds() {
	return COURSE_DEFINITIONS.map(course => course.id);
}
