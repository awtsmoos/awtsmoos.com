/* B"H
Source rows: the list becomes a truthful ledger of layers, crop, family, and scale.
*/
import { reorderSource } from '../layers.js';
import { visualizerFamilyBadge } from '../visualizer/sourceFamilyLabel.js';
import { transformSummary } from './stageTransformCommands.js';

export function appendSourceRows({ dom, state, drawStage, refreshSources }) {
  dom.sourceList.innerHTML = '';
  state.sources.forEach((source, index) => dom.sourceList.append(sourceRow({ state, source, index, drawStage, refreshSources })));
}
function sourceRow({ state, source, index, drawStage, refreshSources }) {
  const li = document.createElement('li'); li.draggable = true; li.dataset.id = source.id; li.className = source.id === state.selectedId ? 'selected-source' : '';
  li.innerHTML = `<strong>${index + 1}. ${safe(source.name)}</strong><span>${safe(sourceDetails(source))}</span>`;
  li.onclick = () => { state.selectedId = source.id; drawStage(state); refreshSources(state); };
  li.ondragstart = event => event.dataTransfer.setData('text/source-id', source.id); li.ondragover = event => event.preventDefault();
  li.ondrop = event => dropRow({ event, state, source, drawStage, refreshSources }); return li;
}
function dropRow({ event, state, source, drawStage, refreshSources }) {
  event.preventDefault();
  if (reorderSource(state, event.dataTransfer.getData('text/source-id'), source.id)) { refreshSources(state); drawStage(state); }
}
function sourceDetails(source) {
  const crop = source.crop && Object.values(source.crop).some(Boolean) ? `crop ${source.crop.left}/${source.crop.top}/${source.crop.right}/${source.crop.bottom}` : '';
  return [posSize(source), source.type, transformSummary(source), visualizerFamilyBadge(source), crop].filter(Boolean).join(' · ');
}
function posSize(source) { return `${Math.round(source.x)},${Math.round(source.y)} · ${Math.round(source.w)}×${Math.round(source.h)}`; }
function safe(text) { return String(text).replace(/[&<>"]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' })[c]); }
