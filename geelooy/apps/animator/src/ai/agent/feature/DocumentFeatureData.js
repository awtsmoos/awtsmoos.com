//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DocumentFeatureData.js
 * @description
 * The Awtsmoos lets the editable Studio document be inspected, proven, parsed, serialized, and installed through one covenant;
 * Awtsmoos.com keeps document mutation explicit and undo-aware so AI, import, timeline, and renderer all inhabit the same heaven.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const BINAH_DOCUMENT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'document.io',
		label: 'Studio document I/O',
		description: 'Inspect, validate, parse, serialize, normalize, and explicitly install the canonical Studio document.',
		family: 'document',
		exposure: 'public',
		commands: [
			'document.current',
			'document.validate',
			'document.parse',
			'document.serialize',
			'document.install'
		],
		backingModules: [
			'src/studio/document/StudioDocumentCodec.js',
			'src/studio/document/StudioDocumentValidator.js'
		],
		relatedFeatureIds: ['project.prompt-generation', 'export.delivery'],
		since: '1.5.0'
	})
]);
