/* B"H
Livestream visualizer source: one layer listens to routed audio vessels.
The Awtsmoos lets sound become color, wave, particles, and Hebrew letters.
*/
import { makeSourceNode } from '../graph/sourceNode.js';
import { nextId } from '../state.js';
import { defaultVisualizerSettings } from './visualizerDefaults.js';
import { visualizerTargets } from './visualizerRouting.js';

export function makeAudioVisualizerSource(state, customJs = '') {
  const node = makeSourceNode({ id:nextId('livestreamVisualizer'), type:'livestreamVisualizer', name:'Livestream Audio Visualizer', x:160, y:150, w:640, h:260, settings:defaultVisualizerSettings(customJs), mediaKind:'visualizer' });
  node.visualizesAudio = true;
  node.sourcesProvider = () => visualizerTargets(state, node);
  node.visualizerRuntime = { taps:new Map(), frameIndex:0, beatEnergy:0, prevBass:0, customCode:'', customFn:null, customError:'' };
  return node;
}
