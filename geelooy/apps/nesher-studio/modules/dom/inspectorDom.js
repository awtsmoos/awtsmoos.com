/* B"H
 * Inspector DOM vessels.
 * Crop, transform, and visualizer controls remain distinct sparks.
 */
import { mapIds } from './element.js';

export function inspectorDom() {
  return mapIds(['inspectorName','inspectorMeta','cropControls','cropLeft','cropTop','cropRight','cropBottom','cropReset','cropWide','cropVertical','cropSquare','cropCenterSafe','cropClear','transformControls','stageToolTransform','stageToolCrop','sourceLockAspect','sourceScale','fitSource','fillSource','centerSource','resetTransform','visualizerControls','visualizerPreset','visualizerInput','visualizerSensitivity','visualizerBars','visualizerText','visualizerCustomJs','visualizerReset']);
}
