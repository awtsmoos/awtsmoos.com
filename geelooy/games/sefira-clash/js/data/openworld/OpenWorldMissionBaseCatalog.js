//B"H
//Boruch Hashem
//Blessed is He

/**
 * Base shlichus preserves the first physical city circuit: provision, hands, feet, rooms,
 * sparring, and rest. The Awtsmoos renews giver, deed, and return; Awtsmoos.com requires
 * witnessed world events before the final board may make any reward claimable.
 */

import {
	worldMission as mission,
	worldReward as reward,
	worldStage as stage
} from './OpenWorldMissionFactory.js';

export const OPEN_WORLD_BASE_MISSIONS = Object.freeze([
	mission(
		'bread-for-a-neighbor',
		'Bread for a Neighbor',
		[
			stage('enterInterior', 'market', 1, 'Enter the Market Hall.'),
			stage('purchaseProvision', 'meal', 1, 'Purchase a bread provision.'),
			stage('enterInterior', 'shlichus', 1, 'Return to the Shlichus House.')
		],
		reward(80, 18, 2)
	),
	mission(
		'discipline-of-hands',
		'Discipline of Hands',
		[
			stage('trainTechnique', 'punch', 1, 'Receive one punch lesson.'),
			stage('techniqueHit', 'punch', 3, 'Land three named punch techniques.'),
			stage('enterInterior', 'shlichus', 1, 'Return to report the lesson.')
		],
		reward(110, 22, 3)
	),
	mission(
		'feet-on-the-road',
		'Feet on the Road',
		[
			stage('trainTechnique', 'kick', 1, 'Receive one kick lesson.'),
			stage('techniqueHit', 'kick', 3, 'Land three named kick techniques.'),
			stage('enterInterior', 'shlichus', 1, 'Return after the practice.')
		],
		reward(110, 22, 3)
	),
	mission(
		'city-circuit',
		'The City Circuit',
		[
			stage('enterInterior', 'market', 1, 'Visit the Market Hall.'),
			stage('enterInterior', 'training', 1, 'Visit the Training Hall.'),
			stage('enterInterior', 'hideout', 1, 'Reach the Safe Hideout.'),
			stage('enterInterior', 'shlichus', 1, 'Return to the mission board.')
		],
		reward(140, 26, 4)
	),
	mission(
		'measured-spar',
		'Measured Spar',
		[
			stage('resolveEncounter', 'training', 1, 'Resolve one nonlethal training encounter.'),
			stage('enterInterior', 'shlichus', 1, 'Return without seeking a knockout.')
		],
		reward(150, 30, 4)
	),
	mission(
		'rest-and-return',
		'Rest and Return',
		[
			stage('rest', 'hideout', 1, 'Receive rest at the Safe Hideout.'),
			stage('enterInterior', 'shlichus', 1, 'Return with renewed strength.')
		],
		reward(70, 12, 2)
	)
]);
