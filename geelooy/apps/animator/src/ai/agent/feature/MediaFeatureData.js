//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MediaFeatureData.js
 * @description
 * The Awtsmoos lets chosen footage cross from opaque Blob into measured asset and editable video track through one honest gate;
 * Awtsmoos.com reuses the living NLE import service so persistence, URLs, selection, and restoration never fork their state.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const YESOD_MEDIA_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'media.assets',
		label: 'Video media and asset workflows',
		description: 'Inspect media assets, measure video metadata, describe files, and import footage through the shared NLE service.',
		family: 'media',
		exposure: 'environment-gated',
		commands: [
			'media.capabilities',
			'media.assets',
			'media.videoMetadata',
			'media.describeVideo',
			'media.importVideo'
		],
		backingModules: [
			'src/nle/media/VideoMetadataProbe.js',
			'src/nle/media/VideoAssetFactory.js',
			'src/nle/media/VideoImportService.js'
		],
		relatedFeatureIds: ['export.delivery'],
		environment: {
			browser: true,
			animatorRuntime: true,
			inProcessMedia: true
		},
		since: '1.5.0'
	})
]);
