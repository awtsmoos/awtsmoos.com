/* B"H
 * Transform inspector: scale, fit, fill, center, and reset.
 * The source keeps aspect unless the editor explicitly loosens the garment.
 */
import { centerSelectedSource, fitSelectedSource, resetSelectedTransform, setSelectedAspectLock, setSelectedSourceScale, setStageTool } from '../stage/stageTransformCommands.js';
import { normalizeCrop } from '../stage/stageGeometry.js';

export function bindTransformInspector({ dom, state, afterChange, refresh }) {
  dom.stageToolTransform.onclick = () => runTool({ dom, state, afterChange, refresh }, 'transform');
  dom.stageToolCrop.onclick = () => runTool({ dom, state, afterChange, refresh }, 'crop');
  dom.sourceLockAspect.onchange = () => runCommand({ state, afterChange, refresh, message:'Source aspect lock updated.', command:() => setSelectedAspectLock(state, dom.sourceLockAspect.checked) });
  dom.sourceScale.onchange = () => runCommand({ state, afterChange, refresh, message:'Source scale updated.', command:() => setSelectedSourceScale(state, dom.sourceScale.value) });
  dom.fitSource.onclick = () => runCommand({ state, afterChange, refresh, message:'Source fit to canvas.', command:() => fitSelectedSource(state, 'fit') });
  dom.fillSource.onclick = () => runCommand({ state, afterChange, refresh, message:'Source filled canvas.', command:() => fitSelectedSource(state, 'fill') });
  dom.centerSource.onclick = () => runCommand({ state, afterChange, refresh, message:'Source centered.', command:() => centerSelectedSource(state) });
  dom.resetTransform.onclick = () => runCommand({ state, afterChange, refresh, message:'Transform and crop reset.', command:() => resetSelectedTransform(state) });
}

export function syncTransformInspector(dom, source, state) {
  dom.sourceScale.value = source ? source.scalePercent || Math.round(source.w / Math.max(1, source.baseW || source.w) * 100) : 100;
  dom.sourceLockAspect.checked = !source || source.lockAspect !== false; toolClass(dom, state.stageTool || 'transform');
}

export function setInspectorDisabled(dom, disabled) {
  [...dom.cropControls.querySelectorAll('input,button'), ...dom.transformControls.querySelectorAll('input,button')].forEach(input => input.disabled = disabled);
}

function runTool(v, tool) { setStageTool(v.state, tool); v.afterChange?.(`${tool === 'crop' ? 'Crop' : 'Transform'} tool active.`); v.refresh(); }
function runCommand({ state, afterChange, refresh, message, command }) { const ok = command(); afterChange?.(ok ? message : 'Choose a source first.'); refresh(); }
function toolClass(dom, tool) { toggleClass(dom.stageToolCrop, tool === 'crop'); toggleClass(dom.stageToolTransform, tool !== 'crop'); }
function toggleClass(el, active) { el.classList?.toggle ? el.classList.toggle('active', active) : el.className = active ? 'active' : ''; }
export function emptyCrop() { return normalizeCrop(); }
