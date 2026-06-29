/* B"H
Livestream visualizer source: one layer listens to routed audio vessels.
The Awtsmoos lets sound become color, wave, particles, and Hebrew letters.
*/
import { makeSourceNode } from '../graph/sourceNode.js';
import { nextId } from '../state.js';
import { defaultVisualizerSettings, mergeVisualizerSettings } from './visualizerDefaults.js';
import { DEFAULT_VISUALIZER_SOURCE_FAMILY_ID, visualizerSourceFamilyById } from './sourceFamilyRegistry.js';
import { visualizerTargets } from './visualizerRouting.js';

export function makeAudioVisualizerSource(state, familyId = DEFAULT_VISUALIZER_SOURCE_FAMILY_ID, customJs = '') {
  const request = normalizeVisualizerRequest(familyId, customJs);
  const family = visualizerSourceFamilyById(request.familyId);
  const settings = mergeVisualizerSettings(defaultVisualizerSettings(request.customJs), family.settings);
  const node = makeSourceNode({ id:nextId('livestreamVisualizer'), type:'livestreamVisualizer', name:family.label, x:160, y:150, w:640, h:260, settings, mediaKind:'visualizer', meta:{ sourceFamily:family.id } });
  node.visualizesAudio = true; node.sourceFamily = family.id;
  node.sourcesProvider = () => visualizerTargets(state, node);
  node.visualizerRuntime = { taps:new Map(), frameIndex:0, beatEnergy:0, prevBass:0, customCode:'', customFn:null, customError:'' };
  return node;
}

function normalizeVisualizerRequest(familyId, customJs) {
  if (looksLikeCode(familyId) && !customJs) return { familyId:DEFAULT_VISUALIZER_SOURCE_FAMILY_ID, customJs:familyId };
  return { familyId:familyId || DEFAULT_VISUALIZER_SOURCE_FAMILY_ID, customJs:String(customJs || '') };
}
function looksLikeCode(value) {
  return typeof value === 'string' && /[;=(){}]/.test(value);
}
