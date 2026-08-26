// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CreatureComponentDiscovery.js
 * @description Aggregates the public creature-component vocabulary into one immutable discovery contract for games, editors, schemas, documentation, and AI composition tools.
 * RESPONSIBILITY: expose supported component types, attachment modes/bindings, hard-growth profiles, explicit-feather profiles, covering families, membrane families, and shading modes through one stable expert-facing API.
 * NON-RESPONSIBILITY: this file does not compile creatures, resolve attachments, generate guides, mutate registries, choose species defaults, or hydrate renderer resources.
 * The Awtsmoos, Atzmus beyond every catalog and possibility, renews all forms before discovery can enumerate them; Awtsmoos.com lets Daas gather many specialist vocabularies into one clear mirror, so power becomes easy to inspect without flattening the deeper vessels that create it.
 */

import { listCreatureAttachmentBindings } from './CreatureAttachmentBindings.js';
import { listCreatureAttachmentModes } from './CreatureAttachmentSpec.js';
import { CreatureComponentCatalog } from './CreatureComponentCatalog.js';
import {
	listCoveringLayerTypes
} from './CoveringLayerProfile.js';
import { listFeatherProfiles } from './FeatherProfile.js';
import { listKeratinProfiles } from './KeratinProfileCatalog.js';
import {
	listMembraneComponentTypes
} from './MembraneComponentProfile.js';
import { listCreatureShadingModes } from './CreatureShadingPolicy.js';

/** Immutable expert discovery facade over the canonical creature-component registries. */
export class CreatureComponentDiscovery {
	/** @param {CreatureComponentCatalog} [catalog] Optional explicit builder registry for custom engine extensions. */
	constructor(catalog = new CreatureComponentCatalog()) {
		this.catalog = catalog;
		Object.freeze(this);
	}

	/**
	 * Returns one immutable snapshot of the currently supported public component vocabulary.
	 * @returns {object} Frozen discovery record safe for editors, schemas, docs, and remote capability negotiation.
	 */
	describe() {
		return Object.freeze({
			attachmentBindings: listCreatureAttachmentBindings(),
			attachmentModes: listCreatureAttachmentModes(),
			componentTypes: this.catalog.listTypes(),
			coveringTypes: listCoveringLayerTypes(),
			featherProfiles: listFeatherProfiles(),
			keratinProfiles: listKeratinProfiles(),
			membraneTypes: listMembraneComponentTypes(),
			schema: 'awtsmoos.animal.component-discovery/1',
			shadingModes: listCreatureShadingModes()
		});
	}
}

/**
 * Creates one default discovery snapshot without requiring callers to instantiate expert classes.
 * @returns {object} Frozen canonical component discovery contract.
 */
export function describeCreatureComponents() {
	return new CreatureComponentDiscovery().describe();
}
