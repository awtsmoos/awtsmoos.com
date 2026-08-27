// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCreativeCapabilityCatalog.js
 * @description Declares an evidence-bound map of the Studio's present creative surface.
 * The Awtsmoos creates every tool anew while truth refuses borrowed crowns; Awtsmoos.com
 * records what works, what is partial, and what still waits beyond the visible editor.
 */

export const MOVIE_CREATIVE_CAPABILITY_CATALOG = Object.freeze([
	capability('editing.timeline', 'editing', 'Professional timeline editing', 'verified', {
		owners: ['MovieStudioApiTimeline.js', 'MovieProfessionalEdits.js'],
		tests: ['movieProfessionalEdits.test.mjs', 'movieStudioEditorialApi.test.mjs']
	}),
	capability('editing.media-workspace', 'editing', 'Media workspace and catalog', 'partial', {
		missing: ['proxy generation', 'offline relinking', 'multicamera editing'],
		owners: ['MovieStudioApiMedia.js', 'MovieMediaCatalog.js'],
		tests: ['movieMediaWorkspaceContract.test.mjs', 'movieMediaCatalogScale.test.mjs']
	}),
	capability('performance.capture', 'animation', 'Character performance capture', 'verified', {
		browser: ['browser-keyboard-movement-frame-synced.json', 'browser-loop-range-pass.json'],
		owners: ['MovieStudioPerformanceController.js'],
		tests: ['moviePerformanceRecorder.test.mjs', 'moviePerformanceApiContract.test.mjs']
	}),
	capability('compositing.effects', 'compositing', 'Clip appearance and visual effects', 'partial', {
		missing: ['arbitrary layer compositor', 'masks and mattes', 'tracking and rotoscoping'],
		owners: ['MovieVisualEffectDirector.js'],
		tests: ['movieVisualEffectDirector.test.mjs', 'movieClipAppearance.test.mjs']
	}),
	capability('vector.symbol-authoring', 'vector-animation', 'Vector symbols and nested timelines', 'unavailable', {
		missing: ['vector drawing tools', 'symbols', 'shape tweening', 'interactive publishing']
	}),
	capability('three-dimensional.authoring', 'three-dimensional', '3D scene and object authoring', 'partial', {
		missing: ['complete topology tools', 'UV editor', 'armature authoring', 'simulation baking'],
		owners: ['MovieStudioAuthoring3dController.js'],
		tests: ['movieAuthoring3dIntegration.test.mjs', 'movieAuthoring3dVisibleTopology.test.mjs']
	}),
	capability('audio.mixing', 'audio', 'Clip audio mixing and synthesis', 'partial', {
		missing: ['buses', 'sends', 'automation lanes', 'loudness workflow'],
		owners: ['MovieStudioAudioMixerController.js'],
		tests: ['movieAudioMixer.test.mjs', 'movieExactAudioRenderer.test.mjs']
	}),
	capability('delivery.exact-render', 'delivery', 'Deterministic exact rendering', 'verified', {
		owners: ['MovieExactRender.js'],
		tests: ['exactPackageContract.test.mjs', 'movieExactPackageManifest.test.mjs']
	}),
	capability('realtime.world-runtime', 'real-time', 'Real-time world playback and direction', 'partial', {
		missing: ['visual gameplay scripting', 'network authoring', 'world partition', 'deployment cooking'],
		owners: ['MovieSceneWorldDirector.js'],
		tests: ['movieSceneWorldDirector.test.mjs', 'movieWorldActivationService.test.mjs']
	}),
	capability('platform.plugins', 'platform', 'Trusted plugins and runtime adapters', 'verified', {
		owners: ['MovieStudioApiPlugins.js', 'MovieStudioApiRuntimeAdapters.js'],
		tests: ['movieStudioApiPlugins.test.mjs', 'movieRuntimeAdapterRegistry.test.mjs']
	}),
	capability('platform.capability-truth', 'platform', 'Evidence-bound capability discovery', 'verified', {
		owners: ['MovieCreativeCapabilityRegistry.js', 'MovieStudioApiCreativeCapabilities.js'],
		tests: ['movieCreativeCapabilityRegistry.test.mjs', 'movieStudioApiCreativeCapabilities.test.mjs']
	})
]);

export const MOVIE_CREATIVE_WORKFLOWS = Object.freeze([
	workflow('professional-editing', ['editing.timeline', 'editing.media-workspace', 'audio.mixing', 'delivery.exact-render']),
	workflow('motion-compositing', ['editing.timeline', 'compositing.effects', 'delivery.exact-render']),
	workflow('vector-animation', ['vector.symbol-authoring', 'audio.mixing', 'delivery.exact-render']),
	workflow('three-dimensional-production', ['three-dimensional.authoring', 'audio.mixing', 'delivery.exact-render']),
	workflow('real-time-world-production', ['three-dimensional.authoring', 'realtime.world-runtime', 'platform.plugins'])
]);

function capability(id, category, title, status, evidence) {
	return Object.freeze({ category, dependencies: [], evidence, id, status, title });
}

function workflow(id, capabilities) {
	return Object.freeze({ capabilities: Object.freeze(capabilities), id });
}
