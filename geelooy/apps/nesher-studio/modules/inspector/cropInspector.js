/* B"H
 * Crop inspector: numeric crop and quick crop presets.
 * The crop panel is a surgical table for visible light, not a graveyard.
 */
import { selectedSource } from '../graph/sceneGraph.js';
import { applyCenterSafeCrop, applyCropAspect, clearSelectedCrop } from '../stage/stageCropPresets.js';
import { normalizeCrop } from '../stage/stageGeometry.js';

export function bindCropInspector({ dom, state, afterChange, refresh }) {
  cropEntries(dom).forEach(([key, input]) => input.addEventListener('input', () => updateCrop({ dom, state, key, afterChange, refresh })));
  dom.cropReset.onclick = () => runCrop({ state, afterChange, refresh, message:'Crop reset.', command:() => clearSelectedCrop(state) });
  dom.cropClear.onclick = dom.cropReset.onclick;
  dom.cropWide.onclick = () => runCrop({ state, afterChange, refresh, message:'Crop preset 16:9 applied.', command:() => applyCropAspect(state, 16 / 9) });
  dom.cropVertical.onclick = () => runCrop({ state, afterChange, refresh, message:'Crop preset 9:16 applied.', command:() => applyCropAspect(state, 9 / 16) });
  dom.cropSquare.onclick = () => runCrop({ state, afterChange, refresh, message:'Crop preset 1:1 applied.', command:() => applyCropAspect(state, 1) });
  dom.cropCenterSafe.onclick = () => runCrop({ state, afterChange, refresh, message:'Center safe crop applied.', command:() => applyCenterSafeCrop(state, 8) });
}

export function syncCropInspector(dom, source) {
  const crop = normalizeCrop(source?.crop || {});
  cropEntries(dom).forEach(([key, input]) => { input.value = crop[key]; });
}

function updateCrop({ dom, state, key, afterChange, refresh }) {
  const source = selectedSource(state); if (!source) return;
  source.crop = normalizeCrop({ ...(source.crop || {}), [key]:dom[cropId(key)].value });
  afterChange?.(`Crop updated: L${source.crop.left} T${source.crop.top} R${source.crop.right} B${source.crop.bottom}.`); refresh();
}
function runCrop({ state, afterChange, refresh, message, command }) {
  const ok = command(); afterChange?.(ok ? message : 'Choose a source first.'); refresh();
}
function cropEntries(dom) { return [['left', dom.cropLeft], ['top', dom.cropTop], ['right', dom.cropRight], ['bottom', dom.cropBottom]]; }
function cropId(key) { return `crop${key[0].toUpperCase()}${key.slice(1)}`; }
