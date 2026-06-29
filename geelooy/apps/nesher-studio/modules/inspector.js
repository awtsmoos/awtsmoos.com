/* B"H
Inspector: selected sources speak through crop controls and optional visualizer controls.
The panel reveals only the vessels relevant to the selected layer.
*/
import { dom } from './dom.js';
import { selectedSource } from './graph/sceneGraph.js';
import { visualizerFamilyLabel } from './visualizer/sourceFamilyLabel.js';
import { refreshVisualizerInspector } from './visualizer/visualizerInspector.js';

export function refreshInspector(state) {
  const source = selectedSource(state);
  dom.inspectorName.textContent = source ? source.name : 'No source selected';
  dom.inspectorMeta.textContent = source ? meta(source) : 'Click a source, or click empty canvas to deselect.';
  dom.cropControls?.querySelectorAll('input')?.forEach(input => input.disabled = !source);
  source ? setCropInputs(source.crop || {}) : setCropInputs({ left:0, top:0, right:0, bottom:0 });
  refreshVisualizerInspector(state, source);
}
export function bindCropControls(state, afterChange) {
  cropEntries().forEach(([key, input]) => input.addEventListener('input', () => updateCrop(state, key, afterChange)));
  dom.cropReset.addEventListener('click', () => { const source = selectedSource(state); if (!source) return; source.crop = { left:0, top:0, right:0, bottom:0 }; afterChange?.('Crop reset.'); refreshInspector(state); });
}
function updateCrop(state, key, afterChange) {
  const source = selectedSource(state); if (!source) return;
  source.crop = { ...(source.crop || { left:0, top:0, right:0, bottom:0 }), [key]:clampCrop(dom[cropId(key)].value) };
  keepCropBreathing(source.crop); afterChange?.(`Crop updated: L${source.crop.left} T${source.crop.top} R${source.crop.right} B${source.crop.bottom}.`); refreshInspector(state);
}
function setCropInputs(crop) { cropEntries().forEach(([key, input]) => { input.value = clampCrop(crop[key]); }); }
function cropEntries() { return [['left', dom.cropLeft], ['top', dom.cropTop], ['right', dom.cropRight], ['bottom', dom.cropBottom]]; }
function cropId(key) { return `crop${key[0].toUpperCase()}${key.slice(1)}`; }
function meta(source) { return [baseMeta(source), familyMeta(source)].filter(Boolean).join(' · '); }
function baseMeta(source) { return `${source.type} · ${Math.round(source.w)}×${Math.round(source.h)} at ${Math.round(source.x)},${Math.round(source.y)}`; }
function familyMeta(source) { const label = visualizerFamilyLabel(source); return label ? `Visualizer family: ${label}` : ''; }
function clampCrop(value) { const n = Number(value || 0); return Math.max(0, Math.min(90, Number.isFinite(n) ? Math.round(n) : 0)); }
function keepCropBreathing(crop) { if (crop.left + crop.right > 95) crop.right = Math.max(0, 95 - crop.left); if (crop.top + crop.bottom > 95) crop.bottom = Math.max(0, 95 - crop.top); }
