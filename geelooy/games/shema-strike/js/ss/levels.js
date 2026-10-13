/* B"H — Shema Strike levels: 3 gates, side-view 3D platformer.
   Verified: max jump height ~2.9u, max same-height gap ~5.6u, max 2u-rise gap ~4.3u.
   Every platform transition is within those bounds; goals sit on the final platform. */
export const LEVELS = [
	{
		name: 'Gate 1 · Awakening',
		sub: 'Learn to move, jump, and strike.',
		spawn: { x: 0, y: 3 },
		platforms: [
			{ x: 0, y: 0, w: 14, h: 2 },
			{ x: 12, y: 2.2, w: 6, h: 1 },
			{ x: 21, y: 4, w: 6, h: 1 },
			{ x: 30, y: 2.2, w: 6, h: 1 },
			{ x: 39, y: 0, w: 16, h: 2 },
			{ x: 50, y: 3, w: 5, h: 1 },
			{ x: 58, y: 0, w: 18, h: 2 },
		],
		sparks: [
			{ x: 13, y: 4 }, { x: 15, y: 4.4 }, { x: 22, y: 5.8 },
			{ x: 24, y: 5.8 }, { x: 40, y: 2 }, { x: 43, y: 2 },
			{ x: 51, y: 4.8 }, { x: 60, y: 2 }, { x: 63, y: 2 },
		],
		enemies: [
			{ x: 42, y: 1, range: 5, speed: 1.2 },
		],
		goal: { x: 63, y: 1 },
	},
	{
		name: 'Gate 2 · Ascent',
		sub: 'The path climbs. Watch the gaps.',
		spawn: { x: 0, y: 3 },
		platforms: [
			{ x: 0, y: 0, w: 10, h: 2 },
			{ x: 11.5, y: 2.5, w: 5, h: 1 },
			{ x: 20.5, y: 4.5, w: 5, h: 1 },
			{ x: 29, y: 6.5, w: 5, h: 1 },
			{ x: 37, y: 5, w: 4, h: 1 },
			{ x: 44, y: 3, w: 10, h: 2 },
			{ x: 56, y: 5, w: 5, h: 1 },
			{ x: 65, y: 7, w: 5, h: 1 },
			{ x: 73, y: 5, w: 4, h: 1 },
			{ x: 80, y: 3, w: 14, h: 2 },
		],
		sparks: [
			{ x: 13, y: 4.2 }, { x: 22, y: 6.2 }, { x: 30, y: 8.2 },
			{ x: 45, y: 4.8 }, { x: 48, y: 4.8 }, { x: 57, y: 6.8 },
			{ x: 66, y: 8.8 }, { x: 81, y: 4.8 }, { x: 84, y: 5.2 }, { x: 87, y: 4.8 },
		],
		enemies: [
			{ x: 47, y: 4, range: 5, speed: 1.6 },
			{ x: 83, y: 4, range: 6, speed: 2 },
		],
		goal: { x: 83, y: 4 },
	},
	{
		name: 'Gate 3 · The Strike',
		sub: 'Shadows gather. Strike with the Shema!',
		spawn: { x: 0, y: 3 },
		platforms: [
			{ x: 0, y: 0, w: 10, h: 2 },
			{ x: 11, y: 2.5, w: 4, h: 1 },
			{ x: 19, y: 4.5, w: 4, h: 1 },
			{ x: 27, y: 2.5, w: 8, h: 2 },
			{ x: 37, y: 4.5, w: 4, h: 1 },
			{ x: 45, y: 6.5, w: 4, h: 1 },
			{ x: 52, y: 4.5, w: 6, h: 1 },
			{ x: 61, y: 2.5, w: 4, h: 1 },
			{ x: 68, y: 4.5, w: 10, h: 2 },
			{ x: 79, y: 6.5, w: 4, h: 1 },
			{ x: 88, y: 4.5, w: 12, h: 2 },
		],
		sparks: [
			{ x: 12, y: 4.2 }, { x: 28, y: 4.4 }, { x: 31, y: 4.4 },
			{ x: 46, y: 8.2 }, { x: 53, y: 6.2 }, { x: 55, y: 6.2 },
			{ x: 69, y: 6.4 }, { x: 72, y: 6.4 }, { x: 80, y: 8.2 },
			{ x: 89, y: 6.4 }, { x: 92, y: 6.4 }, { x: 95, y: 6.4 },
		],
		enemies: [
			{ x: 29, y: 3.5, range: 4, speed: 1.8 },
			{ x: 70, y: 5.5, range: 5, speed: 2.2 },
			{ x: 91, y: 5.5, range: 5, speed: 2.4 },
		],
		goal: { x: 90, y: 5.5 },
	},
];
