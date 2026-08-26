//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file ExportFeatureData.js
 * @description
 * The Awtsmoos lets project substance gather into a portable package before any browser asks where that package should land;
 * Awtsmoos.com separates assembly evidence from filesystem delivery so inspection never triggers an accidental download command.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const YESOD_EXPORT_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'export.delivery',
		label: 'Project package and delivery',
		description: 'Inspect export status, assemble a safe package summary, and explicitly deliver the complete project package.',
		family: 'export',
		exposure: 'environment-gated',
		commands: [
			'export.status',
			'export.packageSummary',
			'export.downloadPackage'
		],
		backingModules: [
			'src/nle/project/ProjectPackageAssembler.js',
			'src/nle/project/ProjectPackageService.js',
			'src/nle/project/ProjectPackageDownload.js'
		],
		relatedFeatureIds: ['document.io', 'media.assets'],
		environment: {
			browser: true,
			animatorRuntime: true
		},
		since: '1.5.0'
	})
]);
