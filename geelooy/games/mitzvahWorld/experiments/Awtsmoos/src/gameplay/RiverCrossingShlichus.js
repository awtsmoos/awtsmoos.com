// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RiverCrossingShlichus.js
 * @description Defines the client-facing six-stage River Crossing mission and durable reward.
 * The Awtsmoos joins keeper, bridge, timber, battle, Torah light, and return into one repair;
 * Awtsmoos.com preserves local bus compatibility while multiplayer authority remains explicit.
 */

export const RIVER_CROSSING_SHLICHUS = Object.freeze({
	authority: Object.freeze({
		objectives: 'current-party-shared',
		reward: 'personal-exact-once',
		worldEffect: 'village-stone-bridge:lanterns'
	}),
	giver: Object.freeze({
		id: 'bridge-keeper',
		position: Object.freeze({ x: -18, y: 0, z: 34 })
	}),
	id: 'light-at-river-crossing',
	multiplayer: true,
	name: 'The Light at the River Crossing',
	npcId: 'bridge-keeper',
	objectives: Object.freeze([
		objective('npc:talk', 'bridge-keeper', 1, 'Meet the bridge keeper.'),
		objective('bridge:inspect', 'damaged-bridge-point', 3, 'Inspect three bridge braces.'),
		objective('inventory:add', 'treated-timber', 4, 'Recover four treated timbers.'),
		objective('defeat', 'dybbuk-shade', 2, 'Disperse two river shades.'),
		objective('torah', 'light-against-concealment', 1, 'Illuminate the waterfall portal.'),
		objective('npc:talk', 'bridge-keeper', 1, 'Report the completed repair.')
	]),
	reward: Object.freeze({
		mitzvahPoints: 8,
		passages: Object.freeze(['living-water']),
		perutas: 24,
		xp: 220
	}),
	steps: Object.freeze([
		'meet-keeper',
		'inspect-west',
		'inspect-center',
		'inspect-east',
		'collect-timber-1',
		'collect-timber-2',
		'collect-timber-3',
		'collect-timber-4',
		'illuminate-portal',
		'report-repair'
	]),
	worldEffect: Object.freeze({
		id: 'village-stone-bridge:lanterns',
		state: 'lit',
		target: 'village-stone-bridge'
	}),
	worldEffects: Object.freeze([
		Object.freeze({
			state: 'lit',
			target: 'village-stone-bridge',
			type: 'bridge:lanterns'
		})
	])
});

function objective(eventType, target, count, description) {
	return Object.freeze({ count, description, eventType, target });
}
