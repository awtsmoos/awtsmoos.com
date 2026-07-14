//B"H
//Boruch Hashem
//Blessed is He

/**
 * Expanded shlichus binds citizens, archive, clinic, ferry, kitchen, council, guesthouse,
 * patrol, investigation, and restraint into ordered civic journeys. The Awtsmoos renews
 * many forms of service; Awtsmoos.com rewards knowledge and reputation before gear power.
 */

import {
	worldMission as mission,
	worldReward as reward,
	worldStage as stage
} from './OpenWorldMissionFactory.js';

export const OPEN_WORLD_EXPANDED_MISSIONS = Object.freeze([
	mission(
		'meet-the-city',
		'Meet the Living City',
		[
			stage('speakCitizen', 'role:merchant', 1, 'Speak with a merchant.'),
			stage('speakCitizen', 'role:trainer', 1, 'Speak with a trainer.'),
			stage('speakCitizen', 'role:elder', 1, 'Speak with a civic elder.'),
			stage('enterInterior', 'shlichus', 1, 'Return with the names you learned.')
		],
		reward(160, 28, 5)
	),
	mission(
		'archive-clue',
		'The Archive Clue',
		[
			stage('investigate', 'archive', 1, 'Inspect the Civic Archive.'),
			stage('speakCitizen', 'role:scholar', 1, 'Discuss the clue with a scholar.'),
			stage('enterInterior', 'shlichus', 1, 'Return with the interpretation.')
		],
		reward(170, 30, 5)
	),
	mission(
		'clinic-round',
		'A Round of Care',
		[
			stage('visitService', 'clinic', 1, 'Receive care at the clinic.'),
			stage('speakCitizen', 'role:healer', 1, 'Speak with a healer.'),
			stage('enterInterior', 'shlichus', 1, 'Report what the neighborhood needs.')
		],
		reward(130, 24, 4)
	),
	mission(
		'prepared-passage',
		'Prepared Passage',
		[
			stage('purchaseProvision', 'passage', 1, 'Purchase a passage token.'),
			stage('preparePassage', 'ferry', 1, 'Prepare a lawful crossing.'),
			stage('enterInterior', 'shlichus', 1, 'Return with the passage record.')
		],
		reward(180, 34, 5)
	),
	mission(
		'common-table',
		'The Common Table',
		[
			stage('prepareProvision', 'meal', 1, 'Prepare a meal in the community kitchen.'),
			stage('speakCitizen', 'role:cook', 1, 'Speak with the city cook.'),
			stage('enterInterior', 'shlichus', 1, 'Return after the meal is prepared.')
		],
		reward(120, 20, 4)
	),
	mission(
		'council-ear',
		'Listen at Council',
		[
			stage('visitService', 'council', 1, 'Attend a council session.'),
			stage('speakCitizen', 'role:elder', 1, 'Hear one elder directly.'),
			stage('enterInterior', 'shlichus', 1, 'Return without changing their words.')
		],
		reward(150, 25, 5)
	),
	mission(
		'guesthouse-news',
		'News from the Guesthouse',
		[
			stage('rest', 'guesthouse', 1, 'Rest and receive guesthouse news.'),
			stage('speakCitizen', 'role:host', 1, 'Speak with a host.'),
			stage('enterInterior', 'shlichus', 1, 'Return with the rumor recorded.')
		],
		reward(105, 18, 3)
	),
	mission(
		'three-point-patrol',
		'Three-Point Patrol',
		[
			stage('patrol', 'city', 3, 'Visit three marked patrol points.'),
			stage('enterInterior', 'shlichus', 1, 'Return after the complete patrol.')
		],
		reward(190, 32, 6)
	),
	mission(
		'quiet-investigation',
		'A Quiet Investigation',
		[
			stage('investigate', 'street-clue', 2, 'Inspect two street clues.'),
			stage('speakCitizen', 'role:investigator', 1, 'Speak with an investigator.'),
			stage('enterInterior', 'archive', 1, 'File the findings in the archive.'),
			stage('enterInterior', 'shlichus', 1, 'Return to close the inquiry.')
		],
		reward(220, 38, 7)
	),
	mission(
		'guard-with-restraint',
		'Guard with Restraint',
		[
			stage('parry', 'training', 2, 'Complete two measured parries.'),
			stage('resolveEncounter', 'training', 1, 'Resolve the spar nonlethally.'),
			stage('enterInterior', 'shlichus', 1, 'Return after restraint was proven.')
		],
		reward(230, 40, 7)
	)
]);
