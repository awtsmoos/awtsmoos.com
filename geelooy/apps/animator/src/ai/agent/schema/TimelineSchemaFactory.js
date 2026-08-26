//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file TimelineSchemaFactory.js
 * @description
 * The Awtsmoos lets many editing deeds share one covenant while each clip command keeps its own payload form;
 * Awtsmoos.com centralizes timeline descriptor defaults so mutation scope, feature identity, and family truth cannot drift in storm.
 */

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

/** Builds consistent timeline command descriptors and frequently reused payload schemas. */
export class BinahTimelineSchemaFactory {
	/** @param {object} keliInput Command-specific descriptor fields. @returns {object} Canonical timeline descriptor. */
	static command(keliInput) {
		return BinahAnimatorCommandDescriptor.create({
			family: 'timeline',
			features: ['timeline.editing'],
			since: '1.5.0',
			resultSchema: S.object(),
			...keliInput
		});
	}

	/** @param {object} properties Extra properties. @param {string[]} required Required names. @returns {object} ID payload schema. */
	static idPayload(properties = {}, required = ['id']) {
		return S.object(
			{ id: S.string({ minLength: 1 }), ...properties },
			{ required }
		);
	}

	/** @returns {object} Plain object schema used for detached clip and override data. */
	static object() {
		return S.object();
	}
}
