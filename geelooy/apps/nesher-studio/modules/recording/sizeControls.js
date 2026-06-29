/* B"H
Size controls: the default path preserves proportion.
Only an explicit unlock lets width and height walk separately.
*/
import { aspectOptionsHtml, ratioIdForSize, ratioValue, sizeWithLockedAspect } from './aspectRatio.js';
import { RESOLUTION_PRESETS, CUSTOM_PRESET_ID, presetOptionsHtml, presetIdForSize, sanitizeSize, sizeForPreset } from './resolutionPresets.js';

export function bindSizeControls({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }) {
  dom.resolutionPreset.innerHTML = presetOptionsHtml();
  dom.aspectRatio.innerHTML = aspectOptionsHtml();
  dom.aspectLock.checked = state.aspectLock !== false;
  syncControlsFromState(dom, state);
  const deps = { dom, state, resizeStage, createExportPlan, renderNle, setStatus };
  dom.resolutionPreset.addEventListener('change', () => applyPreset(deps));
  dom.aspectRatio.addEventListener('change', () => applyRatio(deps));
  dom.aspectLock.addEventListener('change', () => applyCustomSize(deps));
  dom.canvasWidth.addEventListener('input', () => lockDimension(deps, 'width'));
  dom.canvasHeight.addEventListener('input', () => lockDimension(deps, 'height'));
  dom.canvasWidth.addEventListener('change', () => applyCustomSize(deps));
  dom.canvasHeight.addEventListener('change', () => applyCustomSize(deps));
  dom.fps.addEventListener('change', () => applyCustomSize(deps));
  dom.swapSize.addEventListener('click', () => swapSize(deps));
  dom.applySize.addEventListener('click', () => applyCustomSize(deps));
}

export function syncControlsFromState(dom, state) {
  dom.canvasWidth.value = state.width;
  dom.canvasHeight.value = state.height;
  dom.fps.value = state.fps;
  dom.resolutionPreset.value = presetIdForSize(state.width, state.height);
  dom.aspectRatio.value = ratioIdForSize(state.width, state.height);
}

export function applyPreset(deps) {
  const { dom, state } = deps;
  const next = sizeForPreset(dom.resolutionPreset.value, state);
  dom.canvasWidth.value = next.width;
  dom.canvasHeight.value = next.height;
  dom.aspectRatio.value = ratioIdForSize(next.width, next.height);
  dom.fps.value = sanitizeSize({ fps:dom.fps.value }).fps;
  applyStageSize(deps, `${labelForPreset(dom.resolutionPreset.value)} applied`);
}

export function applyRatio(deps) {
  const { dom } = deps;
  if (!dom.aspectLock.checked) return applyCustomSize(deps);
  const ratio = ratioValue(dom.aspectRatio.value, dom.canvasWidth.value, dom.canvasHeight.value);
  const locked = sizeWithLockedAspect({ width:dom.canvasWidth.value, height:dom.canvasHeight.value, ratio });
  dom.canvasWidth.value = locked.width;
  dom.canvasHeight.value = locked.height;
  applyStageSize(deps, 'Aspect ratio applied');
}

export function lockDimension(deps, changed) {
  const { dom } = deps;
  dom.resolutionPreset.value = presetIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
  if (!dom.aspectLock.checked) { dom.aspectRatio.value = ratioIdForSize(dom.canvasWidth.value, dom.canvasHeight.value); return; }
  const ratio = ratioValue(dom.aspectRatio.value, dom.canvasWidth.value, dom.canvasHeight.value);
  const locked = sizeWithLockedAspect({ width:dom.canvasWidth.value, height:dom.canvasHeight.value, changed, ratio });
  dom.canvasWidth.value = locked.width;
  dom.canvasHeight.value = locked.height;
}

export function swapSize(deps) {
  const { dom } = deps;
  const oldWidth = dom.canvasWidth.value;
  dom.canvasWidth.value = dom.canvasHeight.value;
  dom.canvasHeight.value = oldWidth;
  dom.aspectRatio.value = ratioIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
  applyStageSize(deps, 'Canvas orientation swapped');
}

export function applyCustomSize(deps) {
  const { dom } = deps;
  dom.resolutionPreset.value = presetIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
  dom.aspectRatio.value = ratioIdForSize(dom.canvasWidth.value, dom.canvasHeight.value);
  applyStageSize(deps, 'Canvas size applied');
}

export function applyStageSize({ dom, state, resizeStage, createExportPlan, renderNle, setStatus }, label = 'Stage size applied') {
  const size = sanitizeSize({ width:dom.canvasWidth.value, height:dom.canvasHeight.value, fps:dom.fps.value });
  Object.assign(state, { width:size.width, height:size.height, fps:size.fps, aspectLock:dom.aspectLock.checked });
  state.commit?.('stage size');
  state.exportPlan = createExportPlan(state);
  resizeStage(state);
  renderNle(state, dom);
  syncControlsFromState(dom, state);
  setStatus(`${label}: ${state.width}×${state.height} @ ${state.fps}fps; aspect ${dom.aspectLock.checked ? 'locked' : 'unlocked'}.`);
  return size;
}

function labelForPreset(id) {
  return RESOLUTION_PRESETS.find(preset => preset.id === id)?.label || (id === CUSTOM_PRESET_ID ? 'Custom' : 'Resolution preset');
}
