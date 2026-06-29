/* B"H
Size controls: presets and custom dimensions stop being decorations and become stage reality.
The canvas garment changes, the project remembers, and the frame is redrawn at once.
*/
import { RESOLUTION_PRESETS, CUSTOM_PRESET_ID, presetOptionsHtml, presetIdForSize, sanitizeSize, sizeForPreset } from './resolutionPresets.js';

export function bindSizeControls({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }) {
  dom.resolutionPreset.innerHTML = presetOptionsHtml();
  syncControlsFromState(dom, state);
  dom.resolutionPreset.addEventListener('change', () => applyPreset({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }));
  dom.canvasWidth.addEventListener('input', () => markCustomWhenNeeded(dom));
  dom.canvasHeight.addEventListener('input', () => markCustomWhenNeeded(dom));
  dom.applySize.addEventListener('click', () => applyCustomSize({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }));
}

export function syncControlsFromState(dom, state) {
  dom.canvasWidth.value = state.width;
  dom.canvasHeight.value = state.height;
  dom.fps.value = state.fps;
  dom.resolutionPreset.value = presetIdForSize(state.width, state.height);
}

export function applyPreset(deps) {
  const { dom, state, setStatus } = deps;
  if (dom.resolutionPreset.value === CUSTOM_PRESET_ID) return applyCustomSize(deps);
  const next = sizeForPreset(dom.resolutionPreset.value, state);
  dom.canvasWidth.value = next.width;
  dom.canvasHeight.value = next.height;
  dom.fps.value = sanitizeSize({ fps:dom.fps.value }).fps;
  applyStageSize(deps, `${labelForPreset(dom.resolutionPreset.value)} applied`);
}

export function applyCustomSize(deps) {
  const { dom } = deps;
  dom.resolutionPreset.value = presetIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
  applyStageSize(deps, dom.resolutionPreset.value === CUSTOM_PRESET_ID ? 'Custom size applied' : 'Preset size applied');
}

export function applyStageSize({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }, label = 'Stage size applied') {
  const size = sanitizeSize({ width:dom.canvasWidth.value, height:dom.canvasHeight.value, fps:dom.fps.value });
  state.width = size.width;
  state.height = size.height;
  state.fps = size.fps;
  state.commit?.('stage size');
  state.exportPlan = createExportPlan(state);
  resizeStage(state);
  renderNle(state, dom);
  syncControlsFromState(dom, state);
  setStatus(`${label}: ${state.width}×${state.height} @ ${state.fps}fps.`);
  return size;
}

function markCustomWhenNeeded(dom) {
  dom.resolutionPreset.value = presetIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
}

function labelForPreset(id) {
  return RESOLUTION_PRESETS.find(preset => preset.id === id)?.label || 'Resolution preset';
}
