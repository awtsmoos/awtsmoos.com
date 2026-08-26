//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file CharacterFeatureData.js
 * @description
 * The Awtsmoos lets identity, design, family, preset, and acting emerge as named creative powers before a scene is changed;
 * Awtsmoos.com keeps character planning detached from document mutation, so agents may explore deeply while authored state remains arranged.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const TIFERES_CHARACTER_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'character.authoring',
		label: 'Character design and generation',
		description: 'Discover presets and references, generate deterministic families, and propose validated character designs.',
		family: 'character',
		exposure: 'public',
		commands: [
			'character.capabilities',
			'character.presets',
			'character.createPreset',
			'character.family',
			'character.references',
			'character.proposeDesign'
		],
		backingModules: [
			'src/character/customizer/CharacterDesignProposalService.js',
			'src/character/generator/CharacterFamilyGenerator.js',
			'src/character/reference/ReferenceCharacterCatalog.js',
			'src/character/human/HumanPresetFactory.js'
		],
		relatedFeatureIds: ['character.performance', 'performance.composition'],
		since: '1.5.0'
	}),
	BinahAnimatorFeatureDescriptor.create({
		id: 'character.performance',
		label: 'Character performance composition',
		description: 'Compose layered renderer-facing body, face, gaze, gesture, locomotion, and speech performance data.',
		family: 'character',
		exposure: 'public',
		commands: ['character.composePerformance'],
		backingModules: ['src/character/performance/CharacterPerformanceComposer.js'],
		relatedFeatureIds: ['character.authoring', 'performance.composition'],
		since: '1.5.0'
	})
]);
