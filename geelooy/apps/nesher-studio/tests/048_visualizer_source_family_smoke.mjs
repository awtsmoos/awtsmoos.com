import assert from 'node:assert/strict';
import { makeAudioVisualizerSource } from '../modules/visualizer/audioVisualizerSource.js';
import { VISUALIZER_SOURCE_FAMILIES, visualizerFamilySummary, visualizerSourceFamilyById } from '../modules/visualizer/sourceFamilyRegistry.js';

const state = { sources:[], selectedId:null };
assert.ok(VISUALIZER_SOURCE_FAMILIES.length >= 5);
for (const family of VISUALIZER_SOURCE_FAMILIES) {
  const node = makeAudioVisualizerSource(state, family.id);
  assert.equal(node.type, 'livestreamVisualizer');
  assert.equal(node.sourceFamily, family.id);
  assert.equal(node.settings.preset, family.settings.preset);
  assert.equal(node.meta.sourceFamily, family.id);
}
assert.equal(visualizerSourceFamilyById('missing').id, VISUALIZER_SOURCE_FAMILIES[0].id);
assert.ok(visualizerFamilySummary().every(x => x.id && x.label && x.preset));
console.log('B"H visualizer source family smoke passed');
