// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file AnatomicalComponent.js
 * @description Defines one immutable renderer-neutral biological component recipe with independent placement and action semantics.
 * RESPONSIBILITY: normalize identity, attachment, component action, profile, transforms, material, shading, rig intent, symmetry, repetition, and deterministic seed lineage.
 * NON-RESPONSIBILITY: this module does not resolve frames, execute replacement or blending, generate geometry, append bones, or hydrate renderer resources.
 * The Awtsmoos renews where a vessel stands and what deed it means to reveal; Awtsmoos.com keeps placement and action distinct so eye, mouth, horn, fin, feather, wall, and stranger forms may compose through one clear will.
 */

import { createCreatureAttachmentSpec } from './CreatureAttachmentSpec.js';
import { createCreatureComponentAction } from './CreatureComponentAction.js';
import {
	boundedComponentInteger,
	componentRecord,
	normalizeComponentProfile,
	normalizeComponentScale,
	normalizeComponentVector,
	optionalComponentToken,
	requiredComponentToken
} from './AnatomicalComponentValues.js';

const COMPONENT_SCHEMA = 'awtsmoos.animal.component/1';

/** Immutable anatomical component recipe shared by every specialist builder. */
export class AnatomicalComponent {
	/**
	 * @param {object} input Semantic anatomy recipe and renderer-neutral intent.
	 * @throws {TypeError|RangeError} When required tokens, vectors, attachment, or action data are malformed.
	 */
	constructor(input = {}) {
		this.schema = COMPONENT_SCHEMA;
		this.id = optionalComponentToken(input.id);
		this.type = requiredComponentToken(input.type, 'type').toLowerCase();
		this.attachment = createCreatureAttachmentSpec(
			input.attach ?? input.attachment ?? {}
		);
		this.action = createCreatureComponentAction(
			input.action ?? input.operation ?? 'attach'
		);
		this.profile = Object.freeze(normalizeComponentProfile(
			input.profile ?? input.style
		));
		this.scale = Object.freeze(normalizeComponentScale(input.scale));
		this.rotation = Object.freeze(normalizeComponentVector(
			input.rotation,
			[0, 0, 0],
			'rotation'
		));
		this.material = Object.freeze(componentRecord(input.material));
		this.shading = Object.freeze(componentRecord(input.shading));
		this.rig = Object.freeze(componentRecord(input.rig));
		this.mirror = Boolean(input.mirror);
		this.count = boundedComponentInteger(input.count, 1, 1, 512);
		this.seed = input.seed ?? 0;
		Object.freeze(this);
	}
}

/** Creates or preserves one canonical anatomical component recipe. */
export function createAnatomicalComponent(input = {}) {
	return input instanceof AnatomicalComponent
		? input
		: new AnatomicalComponent(input);
}
