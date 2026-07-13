// B"H
// Boruch Hashem
// Blessed is He

import * as Quests from '../../js/workers/quests.js';

function assert(condition, message) {
	if (!condition) throw new Error(message);
}

const state = {
	currentMapId: 'malkuth_village',
	player: {
		level: 5,
		money: { perutah: 10 },
		inventory: [],
		team: [{ id: 'clay_golem', level: 5 }],
		flags: {},
		mapChanges: {},
		activeQuests: [],
		completedQuests: []
	},
	db: {
		items: {
			scribe_reed: { id: 'scribe_reed', name: 'Scribe Reed' },
			restorative_tea: { id: 'restorative_tea', name: 'Restorative Tea' }
		},
		quests: {
			chapter_zero_one: {
				id: 'chapter_zero_one',
				title: 'Ink Learns a Name',
				category: 'main',
				objectives: [
					{ id: 'reeds', type: 'collect_item', targetId: 'scribe_reed', required: 2, mapId: 'malkuth_village', text: 'Gather reeds' },
					{ id: 'blotlings', type: 'defeat_species', targetId: 'blotling', required: 2, text: 'Defeat Blotlings' },
					{ id: 'oren', type: 'dialogue_flag', targetId: 'oren_ready', required: 1, text: 'Return to Oren' }
				],
				rewards: {
					money: 25,
					items: [{ itemId: 'restorative_tea', quantity: 2 }],
					reputation: [{ factionId: 'malkuth_village', amount: 50 }]
				},
				mapChanges: [{ mapId: 'malkuth_village', changeId: 'hall_lectern_awake' }]
			},
			chapter_zero_two: {
				id: 'chapter_zero_two',
				title: 'The First Echo',
				category: 'main',
				prerequisites: ['chapter_zero_one'],
				objectives: [
					{ id: 'elevate', type: 'elevate_musag', targetId: 'orchard_wisp', required: 1, text: 'Elevate the Orchard Wisp' }
				],
				rewards: { playerXp: 100 }
			}
		}
	}
};

let checks = 0;
const check = (condition, message) => { assert(condition, message); checks += 1; };

check(!Quests.accept(state, 'chapter_zero_two'), 'Prerequisites must block later quests.');
check(Quests.accept(state, 'chapter_zero_one'), 'The first quest must be accepted.');
check(state.player.trackedQuestId === 'chapter_zero_one', 'The first accepted quest must be tracked.');
Quests.updateObjective(state, { type: 'collect_item', targetId: 'scribe_reed', quantity: 1, mapId: 'yesod_shore' });
check(state.player.activeQuests[0].objectives[0].current === 0, 'Wrong maps must not progress objectives.');
Quests.giveItem(state, 'scribe_reed', 3);
check(state.player.activeQuests[0].objectives[0].current === 2, 'Progress must clamp at the required count.');
Quests.updateObjective(state, { type: 'defeat', musagId: 'dust_mite', count: 4 });
check(state.player.activeQuests[0].objectives[1].current === 0, 'Wrong species must not progress defeat objectives.');
Quests.updateObjective(state, { type: 'defeat', musagId: 'blotling', count: 2 });
Quests.updateObjective(state, { type: 'dialogue', flag: 'oren_ready' });
check(Quests.getStatus(state, 'chapter_zero_one') === 'ready', 'All objectives must make the quest ready.');
check(Quests.getQuestLogPayload(state).groups.main.length === 1, 'The quest log must group main quests.');
check(Quests.finalize(state, 'chapter_zero_one'), 'A ready quest must turn in.');
check(state.player.money.perutah === 35, 'Money rewards must be delivered.');
check(state.player.inventory.filter(item => item.id === 'restorative_tea').length === 2, 'Item quantities must be delivered.');
check(state.player.reputation.malkuth_village === 50, 'Reputation rewards must be delivered.');
check(state.player.mapChanges.malkuth_village.hall_lectern_awake, 'World changes must persist on the player.');
check(Quests.getStatus(state, 'chapter_zero_two') === 'available', 'Completion must unlock the next quest.');
check(!Quests.finalize(state, 'chapter_zero_one'), 'Rewards must not be delivered twice.');
check(state.player.money.perutah === 35, 'Duplicate turn-in must not duplicate money.');
check(Quests.accept(state, 'chapter_zero_two'), 'The unlocked quest must be accepted.');
Quests.emit(state, { type: 'musag_elevated', musagId: 'orchard_wisp' });
check(Quests.getStatus(state, 'chapter_zero_two') === 'ready', 'Event aliases must progress elevation objectives.');
check(Quests.finalize(state, 'chapter_zero_two'), 'The second quest must complete.');
check(state.player.xp === 100, 'Player experience rewards must be delivered.');

console.log(JSON.stringify({ ok: true, checks }));
