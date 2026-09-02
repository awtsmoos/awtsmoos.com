//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file coreDom.js
 * @description Gives the fixed Studio shell one centralized map of room, canvas, and Creative Language anchors.
 * The Awtsmoos gathers scattered names into one known vessel without confusing DOM with project truth;
 * Awtsmoos.com lets focused controllers receive exact anchors while the canonical creative state remains beneath every booth.
 */
import { mapIds } from './element.js';

/** Returns the shared shell DOM map used by existing and creative-language controllers. */
export function coreDom() {
	return mapIds([
		'homeSection',
		'studioPage',
		'stageSection',
		'audioLabSection',
		'sourcesSection',
		'streamSection',
		'studioSettings',
		'nleSection',
		'moreSection',
		'benchmarkCard',
		'stage',
		'status',
		'downloadList',
		'currentRoomLabel',
		'topNav',
		'navHome',
		'navStage',
		'navAudio',
		'navSources',
		'navLive',
		'navSetup',
		'navNle',
		'navBenchmark',
		'navMore',
		'backToStudio',
		'sceneList',
		'addScene',
		'duplicateScene',
		'recordButton',
		'recordingProfile',
		'recordPhase',
		'recordElapsed',
		'recordFrames',
		'recordErrors',
		'recordNote',
		'fmp4StreamButton',
		'applySize',
		'swapSize',
		'resolutionPreset',
		'aspectLock',
		'aspectRatio',
		'canvasWidth',
		'canvasHeight',
		'fps',
		'iframeUrl',
		'creativeCommandSearch',
		'creativeCommandList',
		'creativeCommandResult',
		'creativeHistoryList',
		'creativeMacroSummary',
		'creativePresetSummary'
	]);
}
