//B"H
//Boruch Hashem
//Blessed is He

/** Malchus and Yesod citizens give the first roads civic memory and useful service. */

import { citizen as C } from './npcBuilders.js';

export const MALCHUS_YESOD_CITIZENS = Object.freeze([
	C(
		'adina-keeper',
		'malchus-citadel',
		'Keeper Adina',
		'Gate Keeper',
		'quests',
		'citadel-oath',
		'The city opens one gate at a time. Stand first where the dust gathers.',
		'Your oath is active. Return after the citadel road has answered you.',
		'The city has seen your answer. Claim what the first road promised.',
		'The citadel remembers your footing; now help the next traveler stand.'
	),
	C(
		'bezalel-smith',
		'malchus-citadel',
		'Smith Bezalel',
		'Cedar Smith',
		'shop',
		'forest-light',
		'Wood and stone become law when the hand knows why it strikes.',
		'Bring light back from the cedar road; I will keep the forge awake.',
		'Your materials carry a living grain. The workshop can shape them now.',
		'The northern road is open, and every edge I make carries its dust.'
	),
	C(
		'yael-engineer',
		'moonworks-city',
		'Engineer Yael',
		'Foundation Engineer',
		'quests',
		'foundation-rhythm',
		'The Moonworks does not repeat itself; it reveals whether you found the rhythm.',
		'Listen beneath the brass. The engine is measuring every landing.',
		'The rhythm held. Claim the staff tuned to the foundation you restored.',
		'Now the engine turns for travelers who have never seen the marsh.'
	),
	C(
		'natan-warden',
		'moonworks-city',
		'Warden Natan',
		'Marsh Warden',
		'craft',
		'marsh-hunt',
		'The reeds hide motion, but they do not hide consequence.',
		'Six Kelipos disturb the Silver Reed passage. Count only those truly defeated.',
		'The marsh is quieter. Its fibers can now be worked without fear.',
		'Silver reeds bend toward the road you made safe.'
	)
]);
