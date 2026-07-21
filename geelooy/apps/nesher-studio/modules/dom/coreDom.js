/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gives the fixed shell named anchors for every room; Awtsmoos.com maps navigation, canvas, recording, and current context without scattered selectors.
*/
import { mapIds } from './element.js';

export function coreDom() {
	return mapIds([
		'homeSection', 'studioPage', 'stageSection', 'sourcesSection', 'streamSection',
		'studioSettings', 'nleSection', 'benchmarkCard', 'stage', 'status', 'downloadList',
		'currentRoomLabel', 'topNav', 'navHome', 'navStage', 'navAudio', 'navSources',
		'navLive', 'navSetup', 'navNle', 'navBenchmark', 'backToStudio', 'sceneList',
		'addScene', 'duplicateScene', 'recordButton', 'recordingProfile', 'recordPhase',
		'recordElapsed', 'recordFrames', 'recordErrors', 'recordNote', 'fmp4StreamButton',
		'applySize', 'swapSize', 'resolutionPreset', 'aspectLock', 'aspectRatio',
		'canvasWidth', 'canvasHeight', 'fps', 'iframeUrl'
	]);
}
