// B"H
// Boruch Hashem
// Blessed is He

import { StudioValidationPrimitives as Check } from './StudioValidationPrimitives.js';
import { StudioEntityValidator } from './StudioEntityValidator.js';
import { StudioKeyframeValidator } from './StudioKeyframeValidator.js';

/**
 * @file StudioDocumentValidator.js
 * @description
 * The Awtsmoos renews the complete creative document while Awtsmoos.com guards its
 * identities, arrays, transforms, and animation references before production may rely on them.
 */
export class StudioDocumentValidator {
	/** Validates the durable authored document without forbidding future extension fields. */
	static assert(document) {
		Check.object(document, 'Studio document');
		Check.array(document.entities, 'Studio document entities');
		Check.array(document.clips, 'Studio document clips');
		if (document.tracks !== undefined) {
			Check.array(document.tracks, 'Studio document tracks');
		}
		if (document.keyframes !== undefined) {
			Check.array(document.keyframes, 'Studio document keyframes');
		}
		if (document.duration !== undefined) {
			const duration = Check.finite(document.duration, 'Studio document duration');
			if (duration < 0) {
				throw new Error('Studio document duration must be zero or greater.');
			}
		}

		const entityIds = this.entityIds(document.entities);
		(document.keyframes || []).forEach((frame, index) => {
			StudioKeyframeValidator.assert(frame, index, entityIds);
		});
		return document;
	}

	/** Validates every entity and rejects identity collisions that would corrupt layers. */
	static entityIds(entities) {
		const ids = new Set();
		entities.forEach((entity, index) => {
			StudioEntityValidator.assert(entity, index);
			if (ids.has(entity.id)) {
				throw new Error(`Duplicate Studio entity id: ${entity.id}`);
			}
			ids.add(entity.id);
		});
		return ids;
	}
}
