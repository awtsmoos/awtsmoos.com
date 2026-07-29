// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureCatalog.js
 * @description Defines stable village and Kedem Shlichus records for solo and shared play.
 * The Awtsmoos turns every road, rescue, activity, and trial into one renewing mission;
 * Awtsmoos.com keeps objective identities durable across local, reconnecting, and shared truth.
 */

import { RIVER_CROSSING_SHLICHUS } from './RiverCrossingShlichus.js';

export const ADVENTURE_CATALOG = Object.freeze([
	RIVER_CROSSING_SHLICHUS,
	quest('sparks-at-east-gate', 'Sparks at the East Gate', 'Rabbi Dov Ber', 4, -44, [
		objective('defeat', 'dybbuk-shade', 3, 'Disperse three shades.', 0, -140)
	], reward(120, 3), true),
	quest('guard-the-shul', 'Guard the Shul', 'Shul Gabbai', 8, -48, [
		objective('defeat', 'klipah-guardian', 2, 'Defeat two guardians.', -20, -152)
	], reward(150, 4), true),
	quest('shepherds-mercy', 'The Shepherd’s Mercy', 'Yosef the Shepherd', 103, 42, [
		objective('care', 'kosher-animal', 3, 'Care for three pasture animals.', 111, 43)
	], reward(90, 5), true),
	quest('kosher-provision', 'Kosher Provision', 'Shimon the Provider', 92, 49, [
		objective('harvest', 'kosher-animal', 1, 'Prepare one eligible provision.', 96, 52)
	], reward(130, 5), true),
	quest('orchard-defense', 'Defense of the Orchard', 'Leah the Orchard Keeper', 72, -67, [
		objective('defeat', 'orchard-predator', 2, 'Drive away two predators.', 86, -96)
	], reward(140, 4), true),
	quest('wings-over-lake', 'Wings Over the Lake', 'Mendel the Watchman', 31, -61, [
		objective('defeat', 'fallen-seraph-husk', 3, 'Disperse three fallen husks.', 24, -158)
	], reward(180, 6), true),
	quest('great-spark-refinement', 'The Great Spark Refinement', 'The Elder Shliach', 6, -46, [
		objective('defeat', 'great-dybbuk', 1, 'Defeat the great dybbuk.', 8, -182),
		objective('refine', 'spark', 10, 'Refine ten sparks.', 8, -182)
	], reward(300, 10), true),
	quest('wood-for-the-shul', 'Wood for the Shul', 'Avraham the Carpenter', -54, 12, [
		objective('purchase', 'forest-axe', 1, 'Buy a forest axe.', -43, 14),
		objective('chop', 'fallen-wood', 6, 'Collect six fallen logs.', 82, -112)
	], reward(115, 4), false),
	quest('flowers-for-shabbos', 'Flowers for Shabbos', 'Rivka the Gardener', 67, -45, [
		objective('collect', 'cottage-flower', 8, 'Gather eight permitted flowers.', 72, -52)
	], reward(80, 3), false),
	quest('lost-scroll-by-stream', 'The Scroll by the Stream', 'Moshe the Scribe', -7, 22, [
		objective('collect', 'lost-scroll', 1, 'Recover the scroll near the lower cascade.', -18, 34),
		objective('talk', 'moshe-scribe', 1, 'Return the scroll to Moshe.', -7, 22)
	], reward(100, 4), false),
	quest('forest-predator-patrol', 'Forest Predator Patrol', 'Eliyahu the Ranger', 58, -80, [
		objective('defeat', 'forest-predator', 4, 'Defeat four hostile forest creatures.', 92, -126)
	], reward(170, 5), false),
	quest('letter-highlands-chain', 'Letters Above the Valley', 'Elder Azriel', -107, 96, [
		objective('travel', 'kedem-highlands', 1, 'Cross into the Kedem Highlands.', -106, 101),
		objective('activity', 'herb-gathering', 3, 'Gather three ridge herbs.', -83, 81),
		objective('elite', 'kedem-letter-warden', 1, 'Defeat the Kedem Letter Warden.', -80, 75)
	], reward(420, 12), true),
	quest('words-of-light', 'Words of Light', 'The Beis Midrash Teacher', 15, -50, [
		objective('learn', 'torah-passage', 3, 'Learn three Torah passages.', 15, -50),
		objective('defeat', 'dybbuk-shade', 1, 'Use a learned passage against one shade.', 0, -140)
	], reward(160, 6), false)
]);

export function adventureDefinition(questId) {
	return ADVENTURE_CATALOG.find(item => item.id === questId) || null;
}

function quest(id, name, giver, x, z, objectives, rewardValue, multiplayer) {
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
