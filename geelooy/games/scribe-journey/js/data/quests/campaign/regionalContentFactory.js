// B"H
// Boruch Hashem
// Blessed is He

import { objective as o } from './questFactory.js';

function quest(region, descriptor, kind, sequence, title, summary, objectives) {
	const id = `side_${region}_${kind}_${String(sequence).padStart(2, '0')}`;
	return [id, {
		id,
		chainId: `regional_${region}`,
		sequence,
		title,
		summary,
		category: kind,
		regionId: region,
		level: descriptor.level,
		giverId: descriptor.giverId,
		turnInId: descriptor.giverId,
		prerequisites: [`campaign_${region}_01`],
		objectives,
		rewards: {
			playerXp: 80 + (descriptor.level * 12),
			money: 20 + (descriptor.level * 3),
			reputation: [{ factionId: `${region}_community`, amount: kind === 'event' ? 90 : 40 }]
		}
	}];
}

/** Builds the ten authored regional obligations required around each quest hub. */
export function buildRegionalContent(region, descriptor) {
	const map = descriptor.mapId;
	const entries = [
		quest(region, descriptor, 'community', 1, `Repair ${descriptor.structure}`, `Travelers need ${descriptor.structure} restored before the region can reconnect.`, [o('repair_structure', descriptor.structureId, 4, `Repair 4 parts of ${descriptor.structure}`, map)]),
		quest(region, descriptor, 'community', 2, `Aid for ${descriptor.people}`, `${descriptor.people} are treating residents displaced by the Erasure.`, [o('gather_node', descriptor.material, 8, `Gather 8 ${descriptor.materialName}`, map), o('deliver_item', descriptor.material, 8, `Deliver aid to ${descriptor.people}`, map)]),
		quest(region, descriptor, 'community', 3, `Letters That Waited`, `Old letters reveal promises the community forgot to keep.`, [o('collect_item', 'escaped_archive_page', 5, 'Recover 5 delayed letters', map), o('deliver_group', `${region}_letter_recipient`, 5, 'Deliver the letters to their recipients', map)]),
		quest(region, descriptor, 'research', 4, `Field Notes: ${descriptor.speciesName}`, `Tamar needs ecological observations, not trophies.`, [o('research_species', descriptor.species, 3, `Record 3 behaviors of ${descriptor.speciesName}`, map), o('battle_condition', 'non_damaging_move', 5, 'Use non-damaging moves 5 times', map)]),
		quest(region, descriptor, 'research', 5, `Habitat Under Pressure`, `The local Musagim are changing because their home has lost a relationship.`, [o('inspect_clue', `${region}_habitat_clue`, 6, 'Inspect 6 habitat clues', map), o('calm_species', descriptor.species, 3, `Calm 3 ${descriptor.speciesName}`, map)]),
		quest(region, descriptor, 'profession', 6, `${descriptor.profession} Apprenticeship`, `A named craftsperson teaches a useful regional technique.`, [o('gather_node', descriptor.material, 6, `Gather 6 ${descriptor.materialName}`, map), o('craft_item', descriptor.recipe, 3, `Craft 3 ${descriptor.recipeName}`)]),
		quest(region, descriptor, 'hidden', 7, `The Inscription Beneath ${descriptor.landmark}`, `A hidden line records what official history omitted.`, [o('discover_landmark', descriptor.landmarkId, 1, `Find ${descriptor.landmark}`, map), o('inspect_clue', `${region}_hidden_inscription`, 7, 'Read 7 hidden inscriptions', map)]),
		quest(region, descriptor, 'recurring', 8, `The Cantor’s ${descriptor.noteName} Note`, `The Ragged Cantor sings another fragment of the unfinished melody.`, [o('speak_npc', 'ragged_cantor', 1, 'Find the Ragged Cantor', map), o('collect_item', 'regional_melody_fragment', 1, `Receive the ${descriptor.noteName} fragment`, map)]),
		quest(region, descriptor, 'event', 9, descriptor.eventName, descriptor.eventSummary, [o('protect_target', `${region}_event_target`, 90, 'Protect the community objective', map), o('survive_waves', `${region}_event_wave`, 3, 'Survive 3 event waves', map)]),
		quest(region, descriptor, 'hunt', 10, `Elite Hunt: ${descriptor.eliteName}`, `${descriptor.eliteName} is dangerous because the habitat around it is wounded.`, [o('inspect_clue', `${descriptor.elite}_track`, 4, 'Inspect 4 elite tracks', map), o('defeat_elite', descriptor.elite, 1, `Defeat or redeem ${descriptor.eliteName}`, map)])
	];
	return Object.fromEntries(entries);
}
