/* B"H
Inspector: selected sources speak through crop, transform, aspect, and visualizer controls.
The panel now opens real canvas crop and faithful scaling tools.
*/
import { dom } from './dom.js';
import { selectedSource } from './graph/sceneGraph.js';
import { normalizeCrop } from './stage/stageGeometry.js';
import { centerSelectedSource, fitSelectedSource, resetSelectedTransform, setSelectedAspectLock, setSelectedSourceScale, setStageTool, transformSummary } from './stage/stageTransformCommands.js';
import { visualizerFamilyLabel } from './visualizer/sourceFamilyLabel.js';
import { refreshVisualizerInspector } from './visualizer/visualizerInspector.js';

export function refreshInspector(state) {
  const source = selectedSource(state);
  dom.inspectorName.textContent = source ? source.name : 'No source selected';
  dom.inspectorMeta.textContent = source ? meta(source) : 'Click a source, or click empty canvas to deselect.';
  setDisabled(!source); source ? syncFields(source, state) : setEmptyFields(state); refreshVisualizerInspector(state, source);
}
export function bindCropControls(state, afterChange) {
  cropEntries().forEach(([key, input]) => input.addEventListener('input', () => updateCrop(state, key, afterChange)));
  dom.cropReset.addEventListener('click', () => runSourceEdit(state, afterChange, 'Crop reset.', source => source.crop = emptyCrop()));
  dom.stageToolTransform.onclick = () => runTool(state, afterChange, 'transform'); dom.stageToolCrop.onclick = () => runTool(state, afterChange, 'crop');
  dom.sourceLockAspect.onchange = () => runSourceCommand(state, afterChange, 'Source aspect lock updated.', () => setSelectedAspectLock(state, dom.sourceLockAspect.checked));
  dom.sourceScale.onchange = () => runSourceCommand(state, afterChange, 'Source scale updated.', () => setSelectedSourceScale(state, dom.sourceScale.value));
  dom.fitSource.onclick = () => runSourceCommand(state, afterChange, 'Source fit to canvas.', () => fitSelectedSource(state, 'fit'));
  dom.fillSource.onclick = () => runSourceCommand(state, afterChange, 'Source filled canvas.', () => fitSelectedSource(state, 'fill'));
  dom.centerSource.onclick = () => runSourceCommand(state, afterChange, 'Source centered.', () => centerSelectedSource(state));
  dom.resetTransform.onclick = () => runSourceCommand(state, afterChange, 'Transform and crop reset.', () => resetSelectedTransform(state));
}
function runTool(state, afterChange, tool) { setStageTool(state, tool); afterChange?.(`${tool === 'crop' ? 'Crop' : 'Transform'} tool active.`); refreshInspector(state); }
function runSourceCommand(state, afterChange, message, command) { const ok = command(); afterChange?.(ok ? message : 'Choose a source first.'); refreshInspector(state); }
function runSourceEdit(state, afterChange, message, mutate) { const source = selectedSource(state); if (!source) return; mutate(source); afterChange?.(message); refreshInspector(state); }
function updateCrop(state, key, afterChange) {
  const source = selectedSource(state); if (!source) return;
  source.crop = normalizeCrop({ ...(source.crop || emptyCrop()), [key]:dom[cropId(key)].value });
  afterChange?.(`Crop updated: L${source.crop.left} T${source.crop.top} R${source.crop.right} B${source.crop.bottom}.`); refreshInspector(state);
}
function syncFields(source, state) {
  cropEntries().forEach(([key, input]) => { input.value = normalizeCrop(source.crop)[key]; });
  dom.sourceScale.value = source.scalePercent || Math.round(source.w / Math.max(1, source.baseW || source.w) * 100);
  dom.sourceLockAspect.checked = source.lockAspect !== false; toolClass(state.stageTool || 'transform');
}
function setEmptyFields(state) { cropEntries().forEach(([, input]) => input.value = 0); dom.sourceScale.value = 100; dom.sourceLockAspect.checked = true; toolClass(state.stageTool || 'transform'); }
function setDisabled(disabled) { [...dom.cropControls.querySelectorAll('input,button'), ...dom.transformControls.querySelectorAll('input,button')].forEach(input => input.disabled = disabled); }
function toolClass(tool) { toggleClass(dom.stageToolCrop, tool === 'crop'); toggleClass(dom.stageToolTransform, tool !== 'crop'); }
function toggleClass(el, active) { el.classList?.toggle ? el.classList.toggle('active', active) : el.className = active ? 'active' : ''; }
function cropEntries() { return [['left', dom.cropLeft], ['top', dom.cropTop], ['right', dom.cropRight], ['bottom', dom.cropBottom]]; }
function cropId(key) { return `crop${key[0].toUpperCase()}${key.slice(1)}`; }
function meta(source) { return [baseMeta(source), transformSummary(source), familyMeta(source)].filter(Boolean).join(' · '); }
function baseMeta(source) { return `${source.type} · ${Math.round(source.w)}×${Math.round(source.h)} at ${Math.round(source.x)},${Math.round(source.y)}`; }
function familyMeta(source) { const label = visualizerFamilyLabel(source); return label ? `Visualizer family: ${label}` : ''; }
function emptyCrop() { return { left:0, top:0, right:0, bottom:0 }; }
