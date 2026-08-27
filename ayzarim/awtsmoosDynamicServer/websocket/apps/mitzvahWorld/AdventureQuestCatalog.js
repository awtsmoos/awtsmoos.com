// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AdventureQuestCatalog.js
 * @description Defines eight executable village missions with explicit authority and rewards.
 * The Awtsmoos renews challenge as repair rather than spectacle; Awtsmoos.com distinguishes
 * personal reward, current-party progress, and one persisted public bridge-light effect.
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
	], reward(300, 10)),
	quest('light-at-river-crossing', 'The Light at the River Crossing', [
		objective('river:meet', 'bridge-keeper', 1, 'Meet the bridge keeper.'),
		objective('river:inspect', 'damaged-bridge-point', 3, 'Inspect three bridge braces.'),
		objective('river:timber', 'treated-timber', 4, 'Recover four treated timbers.'),
		objective('defeat', 'dybbuk-shade', 2, 'Disperse two river shades.'),
		objective('river:illuminate', 'waterfall-portal', 1, 'Illuminate the waterfall portal.'),
		objective('river:report', 'bridge-keeper', 1, 'Report the completed repair.')
	], reward(220, 8, 24), riverAuthority())
]);

function quest(id, name, objectives, rewardValue, authority = personalAuthority()) {
	return Object.freeze({
		authority,
		description: objectives.map(item => item.description).join(' '),
		id,
		name,
		objectives: Object.freeze(objectives),
		reward: Object.freeze({ id: `adventure-reward:${id}`, ...rewardValue })
	});
}
function objective(eventType, target, count, description) {
	return Object.freeze({ count, description, eventType, target });
}
function reward(xp, mitzvahPoints, perutas = 0) {
	return { mitzvahPoints, perutas, xp };
}
function personalAuthority() {
	return Object.freeze({ objectives: 'personal', reward: 'personal', worldEffect: null });
}
function riverAuthority() {
	return Object.freeze({
		objectives: 'current-party-shared',
		reward: 'personal-exact-once',
		worldEffect: 'village-stone-bridge:lanterns'
	});
}
function adventureQuestDefinition(questId) {
	return ADVENTURE_QUESTS.find(questValue => questValue.id === questId) || null;
}

module.exports = {
	ADVENTURE_QUESTS,
	adventureQuestDefinition
};
