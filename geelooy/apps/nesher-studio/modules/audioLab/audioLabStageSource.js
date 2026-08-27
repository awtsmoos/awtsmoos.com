/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos lets a laboratory vision enter the scene as a compatible vessel; Awtsmoos.com preserves the existing renderer and recording graph.
*/
import { addSource } from '../graph/sceneGraph.js';
import { makeAudioVisualizerSource } from '../visualizer/audioVisualizerSource.js';

export function addAudioLabSourceToStage(state, configuration) {
	const source = makeAudioVisualizerSource(state);
	source.name = `Audio Lab · ${configuration.preset.name}`;
	source.settings.preset = configuration.preset.stagePreset;
	source.settings.sensitivity = configuration.sensitivity;
	source.settings.bars = Math.round(24 + configuration.density * 72);
	source.settings.hebrewText = configuration.text;
	addSource(state, source);
	return source;
}
