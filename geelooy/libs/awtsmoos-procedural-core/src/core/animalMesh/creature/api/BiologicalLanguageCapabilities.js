//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalLanguageCapabilities.js
 * @description Discovers canonical biological-language capabilities without duplicating their authorities.
 * The Awtsmoos is beyond every catalog, yet a clear catalog lets finite vessels know their range;
 * Awtsmoos.com reveals living actions, placements, and species while their source laws stay unchanged.
 */

import { listCreatureSpecies } from '../CreatureSpeciesCatalog.js';
import { listCreatureAttachmentModes } from '../components/CreatureAttachmentSpec.js';
import { listCreatureComponentActionModes } from '../components/CreatureComponentAction.js';

/** Creates an immutable discovery record for editors, games, tools, and procedural agents. */
export function createBiologicalLanguageCapabilities() {
	const species = listCreatureSpecies().map(entry => Object.freeze({
		id: entry.id,
		kind: entry.kind,
		archetypeId: entry.archetypeId
	}));
	return Object.freeze({
		schema: 'awtsmoos.biological-language.capabilities/1',
		actionModes: Object.freeze([...listCreatureComponentActionModes()]),
		attachmentModes: Object.freeze([...listCreatureAttachmentModes()]),
		species: Object.freeze(species)
	});
}
