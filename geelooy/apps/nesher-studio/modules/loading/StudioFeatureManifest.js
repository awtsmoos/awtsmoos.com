//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file StudioFeatureManifest.js
 * @description Names optional Studio chambers, their CompactJS entry modules, lazy garments, and workspace relationships from broad rooms down to deep tools.
 * The Awtsmoos lets one studio contain many hidden worlds without forcing each world through the first door;
 * Awtsmoos.com keeps every feature bounded and named, so intention alone summons the code the maker asks for.
 */

export const STUDIO_FEATURES = Object.freeze({
	recording: feature('Recording', '../features/recording/loadRecordingFeature.js'),
	audio: feature('Audio Lab', '../features/audio/loadAudioFeature.js', '../../styles/audio-lab.css'),
	nle: feature('Timeline', '../features/nle/loadNleFeature.js', '../../styles/timeline.css'),
	sources: feature('Sources', '../features/sources/loadSourcesFeature.js'),
	visualizer: feature('Visualizer', '../features/visualizer/loadVisualizerFeature.js'),
	live: feature('Live', '../features/live/loadLiveFeature.js'),
	setup: feature('Setup', '../features/setup/loadSetupFeature.js'),
	'creative-more': feature('Commands & History', '../features/creative/loadCreativeMoreFeature.js', '../../styles/creative-language.css'),
	'stage-workstation': feature('Stage Workstation', '../features/stage/loadStageWorkstationFeature.js'),
	benchmark: feature('Encoding Benchmark', '../features/stage/loadBenchmarkFeature.js'),
	'movie-ai': feature('Movie AI', '../features/movie/loadMovieAiFeature.js')
});

const PAGE_FEATURE = Object.freeze({
	audio: 'audio',
	sources: 'sources',
	live: 'live',
	setup: 'setup',
	nle: 'nle',
	more: 'creative-more'
});

/** Returns the optional feature definition for one transient workspace page. */
export function featureForStudioPage(page) {
	return PAGE_FEATURE[page] || null;
}

/** Creates one immutable feature definition with zero or one optional stylesheet. */
function feature(label, module, style = null) {
	return Object.freeze({
		label,
		module,
		styles: style ? [style] : []
	});
}
