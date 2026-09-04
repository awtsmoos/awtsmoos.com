//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file coreDom.js
 * @description Centralizes stable shell, Stage, intent, recording, setup, and Creative Language anchors for focused controllers.
 * The Awtsmoos gathers many visible names into one lookup vessel without confusing DOM references with project truth;
 * Awtsmoos.com lets each controller receive the exact element it needs while the canonical movie remains the deeper root.
 */
import { mapIds } from './element.js';

/**
 * Returns the shared fixed-shell DOM map used across Studio controllers.
 * @returns {object} Element map keyed by stable IDs.
 */
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
		'stageWorkstation',
		'stageCloseWorkstation',
		'stageSelectionContext',
		'stageSelectionName',
		'stageSelectionMeta',
		'stageInspectSelection',
		'primaryIntentBar',
		'intentCreateButton',
		'intentEditButton',
		'intentTimelineButton',
		'intentAnimateButton',
		'intentMoreButton',
		'intentSheetBackdrop',
		'intentSheet',
		'intentSheetEyebrow',
		'intentSheetTitle',
		'intentSheetClose',
		'intentSheetBody',
		'intentSheetStatus',
		'creativeCommandSearch',
		'creativeCommandList',
		'creativeCommandResult',
		'creativeHistoryList',
		'creativeMacroSummary',
		'creativePresetSummary'
	]);
}
