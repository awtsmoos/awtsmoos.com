/* B"H
 * Core studio DOM vessels: stage, navigation, pages, and recording controls.
 * The page is a sea; these anchors let the editor sail without confusion.
 */
import { mapIds } from './element.js';

export function coreDom() {
  return mapIds([
    'homeSection', 'studioPage', 'stage', 'status', 'downloadList', 'topNav',
    'navStage', 'navSources', 'navNle', 'navBenchmark', 'backToStudio',
    'stageSection', 'sourcesSection', 'nleSection', 'benchmarkCard',
    'sceneList', 'addScene', 'duplicateScene', 'recordButton',
    'recordingProfile', 'recordPhase', 'recordElapsed', 'recordFrames',
    'recordErrors', 'recordNote', 'fmp4StreamButton', 'applySize', 'swapSize',
    'resolutionPreset', 'aspectLock', 'aspectRatio', 'canvasWidth',
    'canvasHeight', 'fps', 'iframeUrl'
  ]);
}
