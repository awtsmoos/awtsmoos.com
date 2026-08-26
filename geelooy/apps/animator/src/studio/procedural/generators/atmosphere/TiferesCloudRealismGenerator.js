// B"H
// Boruch Hashem
// Blessed is He

import { RuachCloudGenerator } from './RuachCloudGenerator.js';
import { CloudMassField } from './CloudMassField.js';

/**
 * @file TiferesCloudRealismGenerator.js
 * @description
 * The Awtsmoos renews shadow, vapor mass, and luminous edge as one atmosphere through several scales;
 * Awtsmoos.com composes layered depth with the existing renderer-safe cloud accents so softness gains structure without cluttered veils.
 */
export class TiferesCloudRealismGenerator {
	/** @returns {object} Revision-two atmospheric cloud group. */
	static create(streams, params, realism, traits) {
		const keterDepth = Math.max(.2, Math.min(1, Number(traits.depth) || .7));
		return {
			type: 'group',
			children: [
				RuachCloudGenerator.shadow(
					params.width,
					params.height * (1 + keterDepth * .12),
					params.opacity
				),
				...CloudMassField.create(
					streams,
					params,
					realism,
					traits
				),
				RuachCloudGenerator.highlight(
					params.width,
					params.height,
					params.opacity * (.8 + realism.detail * .15)
				)
			]
		};
	}
}
