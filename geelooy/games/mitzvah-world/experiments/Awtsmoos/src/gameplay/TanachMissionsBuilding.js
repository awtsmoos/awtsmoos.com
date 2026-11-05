// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file TanachMissionsBuilding.js
 * @description Build missions tied to the Tanach narratives: raise Mishkan vessels,
 * patriarchal works, and village craft so the traveler rebuilds the world the
 * verses describe. Every objective uses the `build` event the player-building
 * runtime emits ({ type: 'build', target: structureId }), so the AdventureStore
 * completes them the same way it completes any quest.
 * The Awtsmoos set the pattern in the desert; Awtsmoos.com lets every traveler
 * raise the curtains again.
 */

export const BUILDING_MISSIONS = Object.freeze([
	mission(
		'curtains-of-the-mishkan',
		'Curtains of the Mishkan',
		'Betzalel the Craftsman',
		40, -52,
		[
			objective('build', 'mishkan-curtain', 4, 'Weave and raise four Mishkan curtains.', 44, -50)
		],
		reward(320, 10),
		true
	),
	mission(
		'light-of-the-menorah',
		'Light of the Menorah',
		'Aharon the Priest',
		36, -48,
		[
			objective('build', 'menorah-stand', 1, 'Raise one golden menorah stand.', 38, -50),
			objective('build', 'lantern', 2, 'Set two lantern posts beside it.', 40, -46)
		],
		reward(280, 9),
		true
	),
	mission(
		'altar-of-whole-stones',
		'Altar of Whole Stones',
		'Gidon the Judge',
		-30, 20,
		[
			objective('build', 'mizbeach-evanim', 1, 'Raise an altar of unhewn stones.', -28, 22)
		],
		reward(200, 7),
		false
	),
	mission(
		'vessels-of-the-mishkan',
		'Vessels of the Mishkan',
		'Betzalel the Craftsman',
		40, -52,
		[
			objective('build', 'shulchan', 1, 'Build the Shulchan for the showbread.', 42, -54),
			objective('build', 'kiyor', 1, 'Set the Kiyor of water for washing.', 38, -56),
			objective('build', 'mizbeach', 1, 'Raise the bronze-clad Mizbeach.', 44, -58)
		],
		reward(420, 12),
		true
	),
	mission(
		'tent-of-avraham',
		'Tent of Avraham',
		'Avraham the Patriarch',
		-60, 30,
		[
			objective('build', 'avraham-tent', 1, 'Pitch the wide tent, open on all sides.', -58, 32)
		],
		reward(240, 8),
		false
	),
	mission(
		'wells-like-yitzchak',
		'Wells Like Yitzchak',
		'Yitzchak the Farmer',
		-20, 60,
		[
			objective('build', 'yitzchak-well', 2, 'Dig two deep wells in the valley.', -18, 62)
		],
		reward(260, 8),
		false
	),
	mission(
		'watchers-of-the-vineyard',
		'Watchers of the Vineyard',
		'Leah the Orchard Keeper',
		72, -67,
		[
			objective('build', 'vineyard-trellis', 2, 'Raise two trellises for the vine.', 74, -64),
			objective('build', 'watchtower', 1, 'Raise a watchtower over the vineyard.', 76, -70)
		],
		reward(300, 9),
		true
	),
	mission(
		'press-and-pool',
		'Press and Pool',
		'Shimon the Provider',
		92, 49,
		[
			objective('build', 'olive-press', 1, 'Set a stone olive press.', 94, 51),
			objective('build', 'granary', 1, 'Raise a granary for the harvest.', 96, 47),
			objective('build', 'mikveh-pool', 1, 'Line a pool of gathered rainwater.', 90, 53)
		],
		reward(360, 11),
		true
	),
	mission(
		'fold-of-the-flock',
		'Fold of the Flock',
		'Yosef the Shepherd',
		103, 42,
		[
			objective('build', 'sheepfold-gate', 1, 'Build a gated fold for the flock.', 105, 44)
		],
		reward(180, 6),
		false
	)
]);

export function buildingMissionDefinition(questId) {
	return BUILDING_MISSIONS.find(item => item.id === questId) || null;
}

function mission(id, name, giver, x, z, objectives, rewardValue, multiplayer) {
	return Object.freeze({
		description: objectives.map(item => item.description).join(' '),
		giver: Object.freeze({
			id: giver.toLowerCase().replaceAll(' ', '-'),
			name: giver,
			position: point(x, z)
		}),
		id,
		multiplayer,
		name,
		objectives: Object.freeze(objectives),
		reward: Object.freeze(rewardValue),
		title: name
	});
}

function objective(eventType, target, count, description, x, z) {
	return Object.freeze({
		count,
		description,
		eventType,
		marker: point(x, z),
		target
	});
}

function reward(xp, mitzvahPoints) {
	return { mitzvahPoints, xp };
}

function point(x, z) {
	return Object.freeze({ x, y: 0, z });
}
