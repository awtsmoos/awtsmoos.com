/* B"H
 * Source and layer DOM vessels.
 * A button invites a source; a layer button lifts or lowers its garment.
 */
import { mapIds } from './element.js';

export function sourceDom() {
  return mapIds(['sourceList','addWebcam','addWebcamVideo','addMic','addMonitor','addDisplay','addDisplayVideo','addDisplayAudio','addAudioVisualizer','visualizerFamily','addVisualizerFamily','addCanvas','addIframe','addBrowser','addImage','addVideoFile','addAudioFile','imageFile','videoFile','audioFile','layerUp','layerDown','layerTop','layerBottom','duplicateSource','removeSource']);
}
