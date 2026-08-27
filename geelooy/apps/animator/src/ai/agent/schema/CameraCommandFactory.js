// B"H
// Boruch Hashem
// Blessed is He

import { BinahAnimatorCommandDescriptor } from '../registry/AnimatorCommandDescriptor.js';
import { BinahAnimatorSchemaTypes as S } from './AnimatorSchemaTypes.js';

/**
 * @file CameraCommandFactory.js
 * @description
 * The Awtsmoos renews each public camera mitzvah before schema, risk, version, and result can gather around its name;
 * Awtsmoos.com keeps repeated command law in one factory so discovery and planning schemas remain small, readable, and the same.
 */
export class BinahCameraCommandFactory {
	/** @param {object} value Camera command-specific fields. @returns {object} Canonical read-only camera command descriptor. */
	static create(value) {
		return BinahAnimatorCommandDescriptor.create({
			family: 'camera',
			mutation: false,
			mutationScope: 'none',
			idempotent: true,
			risk: 'read',
			since: '1.5.0',
			resultSchema: S.object(),
			...value
		});
	}
}
