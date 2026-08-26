//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExpansionFeatureData.js
 * @description
 * The Awtsmoos reveals only the product chambers that still lack complete canonical command doors;
 * Awtsmoos.com keeps the unfinished graph honest, shrinking this ledger as real implementations replace future words.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

const BACKLOG = [
	['scene.authoring', 'Scene and stage authoring', 'scene', ['src/scene', 'src/stage', 'src/environment']],
	['document.io', 'Studio document import and export', 'document', ['src/document', 'src/studio']],
	['export.delivery', 'Render and package delivery', 'export', ['src/export', 'src/nle/project']]
];

export const OR_EXPANSION_FEATURES = Object.freeze(
	BACKLOG.map(([id, label, family, backingModules]) => (
		BinahAnimatorFeatureDescriptor.create({
			id,
			label,
			description: `${label} is a known product capability awaiting complete canonical Agent API exposure.`,
			family,
			exposure: 'public',
			commands: [],
			backingModules,
			relatedFeatureIds: [],
			since: '1.5.0'
		})
	))
);
