// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureQuestCatalog.js
 * @description Defines seven executable village adventure missions and rewards.
 * The Awtsmoos renews challenge as a path toward repair; Awtsmoos.com frames every
 * hostile as a fictional husk whose defeat refines sparks rather than glorifying harm.
 */

const ADVENTURE_QUESTS = Object.freeze([
	quest('sparks-at-east-gate', 'Sparks at the East Gate', [
		objective('defeat', 'dybbuk-shade', 3, 'Disperse three dybbuk shades.')
	], reward(120, 3)),
	quest('guard-the-shul', 'Guard the Shul', [
		objective('defeat', 'klipah-guardian', 2, 'Defeat two klipah guardians.')
	], reward(150, 4)),
	quest('shepherds-mercy', 'The Shepherd’s Mercy', [
		objective('care', 'kosher-animal', 3, 'Care for three distinct pasture animals.')
	], reward(90, 5)),
	quest('kosher-provision', 'Kosher Provision', [
		objective('harvest', 'kosher-animal', 1, 'Abstractly harvest one eligible animal.')
	], reward(130, 5)),
	quest('orchard-defense', 'Defense of the Orchard', [
		objective('defeat', 'orchard-predator', 2, 'Defeat two wolves or foxes.')
	], reward(140, 4)),
	quest('wings-over-lake', 'Wings Over the Lake', [
		objective('defeat', 'fallen-seraph-husk', 3, 'Disperse three fallen seraph husks.')
	], reward(180, 6)),
	quest('great-spark-refinement', 'The Great Spark Refinement', [
		objective('defeat', 'great-dybbuk', 1, 'Defeat the great dybbuk.'),
		objective('refine', 'spark', 10, 'Refine ten sparks from hostile husks.')
	], reward(300, 10))
]);

function quest(id, name, objectives, rewardValue) {
	return Object.freeze({
		description: objectives.map((item) => item.description).join(' '),
		id,
		name,
		objectives: Object.freeze(objectives),
		reward: Object.freeze({
			id: `adventure-reward:${id}`,
			...rewardValue
		})
	});
}

function objective(eventType, target, count, description) {
	return Object.freeze({ count, description, eventType, target });
}

function reward(xp, mitzvahPoints) {
	return { mitzvahPoints, xp };
}

function adventureQuestDefinition(questId) {
	return ADVENTURE_QUESTS.find((questValue) => questValue.id === questId) || null;
}

module.exports = {
	ADVENTURE_QUESTS,
	adventureQuestDefinition
};
