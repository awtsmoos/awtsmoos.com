/* B"H
Visualizer inspector: presets, routing, sensitivity, letters, and custom JS become editable.
*/
import { dom } from '../dom.js';
import { selectedSource } from '../graph/sceneGraph.js';
import { VISUALIZER_PRESETS, applyPreset } from './presets/index.js';
import { defaultVisualizerSettings } from './visualizerDefaults.js';
import { applyInputValue, inputValue, visualizerInputOptions } from './visualizerRouting.js';

export function bindVisualizerControls(state, afterChange) {
  dom.visualizerPreset.onchange = () => update(state, afterChange, s => applyPreset(s.settings, dom.visualizerPreset.value), 'Visualizer preset changed.');
  dom.visualizerInput.onchange = () => update(state, afterChange, s => applyInputValue(s.settings, dom.visualizerInput.value), 'Visualizer input changed.');
  dom.visualizerSensitivity.oninput = () => update(state, afterChange, s => s.settings.sensitivity = Number(dom.visualizerSensitivity.value), 'Visualizer sensitivity updated.');
  dom.visualizerBars.oninput = () => update(state, afterChange, s => s.settings.bars = Number(dom.visualizerBars.value), 'Visualizer bars updated.');
  dom.visualizerText.oninput = () => update(state, afterChange, s => s.settings.hebrewText = dom.visualizerText.value, 'Visualizer Hebrew text updated.');
  dom.visualizerCustomJs.oninput = () => update(state, afterChange, s => s.settings.customJs = dom.visualizerCustomJs.value, 'Visualizer custom JS updated.');
  dom.visualizerReset.onclick = () => update(state, afterChange, s => s.settings = defaultVisualizerSettings(), 'Visualizer reset.');
}
export function refreshVisualizerInspector(state, source) {
  const visualizer = source?.type === 'livestreamVisualizer' ? source : null;
  dom.visualizerControls.hidden = !visualizer; if (!visualizer) return;
  fillPresets(visualizer); fillInputs(state, visualizer); fillFields(visualizer);
}
function update(state, afterChange, mutate, message) { const source = selectedSource(state); if (!source || source.type !== 'livestreamVisualizer') return; source.settings ||= defaultVisualizerSettings(); mutate(source); afterChange?.(message); }
function fillPresets(source) { const value = source.settings?.preset || 'hebrewOrbit'; dom.visualizerPreset.innerHTML = VISUALIZER_PRESETS.map(p => `<option value="${p.id}">${p.name}</option>`).join(''); dom.visualizerPreset.value = value; }
function fillInputs(state, source) { const value = inputValue(source.settings); dom.visualizerInput.innerHTML = visualizerInputOptions(state, source).map(o => `<option value="${o.value}">${escapeHtml(o.label)}</option>`).join(''); dom.visualizerInput.value = value; }
function fillFields(source) { const s = source.settings ||= defaultVisualizerSettings(); dom.visualizerSensitivity.value = s.sensitivity ?? 1.35; dom.visualizerBars.value = s.bars ?? 48; dom.visualizerText.value = s.hebrewText || ''; dom.visualizerCustomJs.value = s.customJs || ''; }
function escapeHtml(text) { return String(text).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]); }
