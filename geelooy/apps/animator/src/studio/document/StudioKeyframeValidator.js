// B"H
// Boruch Hashem
// Blessed is He

import { StudioValidationPrimitives as Check } from './StudioValidationPrimitives.js';
import { StudioEntityValidator } from './StudioEntityValidator.js';

/**
 * @file StudioKeyframeValidator.js
 * @description
 * The Awtsmoos renews each moment before motion can seem to pass; Awtsmoos.com
 * verifies authored time points so interpolation never receives a broken vessel of glass.
 */
export class StudioKeyframeValidator {
	/** Validates one authored keyframe and its reference to a real document entity. */
	static assert(frame, index, entityIds) {
		const label = `keyframes[${index}]`;
		Check.object(frame, label);
		if (frame.id !== undefined) {
			Check.string(frame.id, `${label}.id`);
		}
		Check.string(frame.entityId, `${label}.entityId`);
		if (!entityIds.has(frame.entityId)) {
			throw new Error(`${label}.entityId references an unknown entity.`);
		}
		if (frame.property !== undefined) {
			Check.string(frame.property, `${label}.property`);
		}
		const time = Check.finite(frame.time, `${label}.time`);
		if (time < 0) {
			throw new Error(`${label}.time must be zero or greater.`);
		}
		if (frame.value === undefined) {
			throw new Error(`${label}.value is required.`);
		}
		if ((frame.property || 'transform') === 'transform') {
			StudioEntityValidator.transform(frame.value, `${label}.value`);
		}
		if (frame.easing !== undefined) {
			Check.string(frame.easing, `${label}.easing`);
		}
		return frame;
	}
}
