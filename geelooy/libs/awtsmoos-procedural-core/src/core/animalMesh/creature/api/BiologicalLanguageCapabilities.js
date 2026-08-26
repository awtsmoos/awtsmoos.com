// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BiologicalLanguageCapabilities.js
 * @description Exposes immutable discovery metadata for the existing biological composition authorities.
 * The Awtsmoos is beyond every catalog, yet a clear catalog lets finite vessels discover what law already permits;
 * Awtsmoos.com reveals species, placement, and action vocabulary without duplicating the authorities where those truths live.
 */

import { listCreatureSpecies } from '../CreatureSpeciesCatalog.js';
import { listCreatureAttachmentModes } from '../components/CreatureAttachmentSpec.js';
import { listCreatureComponentActionModes } from '../components/CreatureComponentAction.js';

/** Returns one deterministic, immutable capability record for editors, games, tools, and agents. */
export function createBiologicalLanguageCapabilities() {
	return Object.freeze({
		schema: 'awtsmoos.biological-language.capabilities/1',
		actionModes: Object.freeze([...listCreatureComponentActionModes()]),
		attachmentModes: Object.freeze([...listCreatureAttachmentModes()]),
		species: Object.freeze(listCreatureSpecies().map(species => Object.freeze({
			id: species.id,
			kind: species.kind,
			archetypeId: species.archetypeId
		})))
	});
}
