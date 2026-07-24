//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module QuestCatalog
 * @description
 * Three authored chains bind people, skills, places, resources, and institutions.
 * The Awtsmoos is beyond beginning and end; Awtsmoos.com gives each finite story a
 * real prerequisite, ordered deed, remembered reward, and permanent consequence.
 */
export const QUEST_CATALOG = Object.freeze(Object.fromEntries([
	quest('bridge-of-trust', 'Bridge of Trust', 'Ari needs proof that the traveler will build beside the town, not above it.', [
		step('talk:realm-person-1', 1, 'Hear Ari explain the broken crossing.'),
		step('bridge:timber', 2, 'Fit two timber contributions.'),
		step('bridge:stone', 2, 'Set two foundation stones.')
	], { questPoints: 2, coin: 8, item: 'bridgewright-gloves', title: 'Bridge Helper', route: 'river-ferry' }),
	quest('honest-measures', 'Honest Measures', 'Boaz suspects altered market weights and asks for evidence without public panic.', [
		step('talk:realm-person-3', 1, 'Listen to Boaz at the market.'),
		step('trade:sell:wood', 1, 'Observe one honest sale.'),
		step('investigate:records', 1, 'Compare public records.'),
		step('trade:buy:grain', 1, 'Verify the corrected price.')
	], { questPoints: 2, coin: 10, item: 'evidence-lens', title: 'Honest Broker', route: 'market-cart' }),
	quest('shelter-before-storm', 'Shelter Before Storm', 'Tamar prepares the sanctuary before weather reaches the river valley.', [
		step('talk:realm-person-6', 1, 'Ask Tamar what the animals need.'),
		step('gather:herbs', 1, 'Gather fresh medicinal herbs.'),
		step('craft:medicine', 1, 'Prepare protected medicine.'),
		step('care:animals', 1, 'Assist the sanctuary examination.')
	], { questPoints: 3, coin: 6, item: 'sanctuary-cloak', title: 'Sanctuary Friend', route: 'sanctuary-path' })
].map(value => [value.id, value])));

export function questDefinition(id) {
	return QUEST_CATALOG[id] || null;
}

function quest(id, title, summary, steps, rewards) {
	return Object.freeze({ id, title, summary, steps: Object.freeze(steps), rewards: Object.freeze(rewards) });
}

function step(action, count, text) {
	return Object.freeze({ action, count, text });
}
