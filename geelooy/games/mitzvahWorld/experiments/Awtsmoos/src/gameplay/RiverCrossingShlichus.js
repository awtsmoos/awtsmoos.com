// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverCrossingShlichus.js
 * @description Defines the event-driven bridge repair mission and its permanent world result.
 */

export const RIVER_CROSSING_SHLICHUS = Object.freeze({
	description: 'Repair the river crossing, disperse the nearby concealment, and restore its lanterns.',
	giver: Object.freeze({
		id: 'bridge-keeper',
		name: 'Reb Zalman the Bridge Keeper',
		position: point(-18, 34)
	}),
	id: 'light-at-river-crossing',
	location: Object.freeze({ districtId: 'riverbank-bridge', name: 'Riverbank and Bridge Approach' }),
	multiplayer: false,
	name: 'The Light at the River Crossing',
	objectives: Object.freeze([
		objective('meet-keeper', 'npc:talk', 'bridge-keeper', 1, 'Speak with Reb Zalman at the bridge.', -18, 34),
		objective('inspect-damage', 'bridge:inspect', 'damaged-bridge-point', 3, 'Inspect three damaged bridge points.', -12, 39),
		objective('bring-timber', 'inventory:add', 'treated-timber', 4, 'Bring four treated timbers from the workshop.', -43, 14),
		objective('clear-shadows', 'defeat', 'dybbuk-shade', 2, 'Disperse two shadows along the riverbank.', 0, -140),
		objective('illuminate-portal', 'torah', 'light-against-concealment', 1, 'Use Light Against Concealment at the waterfall portal.', -6, -166),
		objective('report-repair', 'npc:talk', 'bridge-keeper', 1, 'Return to Reb Zalman.', -18, 34)
	]),
	reward: Object.freeze({
		mitzvahPoints: 8,
		passages: Object.freeze(['living-water']),
		perutas: 24,
		xp: 220
	}),
	storyIntroduction: 'The bridge still carries travelers, but its darkened lamps and cracked braces invite danger after dusk.',
	title: 'The Light at the River Crossing',
	worldEffects: Object.freeze([
		Object.freeze({ state: 'lit', target: 'village-stone-bridge', type: 'bridge:lanterns' })
	])
});

function objective(id, eventType, target, count, description, x, z) {
	return Object.freeze({ count, description, eventType, id, marker: point(x, z), optional: false, target });
}

function point(x, z) {
	return Object.freeze({ x, y: 0, z });
}
