/* B"H
 * Inspector meta: selected source truth in one readable sentence.
 */
import { visualizerFamilyLabel } from '../visualizer/sourceFamilyLabel.js';
import { cropSummary } from '../stage/stageCropPresets.js';
import { transformSummary } from '../stage/stageTransformCommands.js';

export function renderInspectorMeta(dom, source) {
  dom.inspectorName.textContent = source ? source.name : 'No source selected';
  dom.inspectorMeta.textContent = source ? sourceMeta(source) : 'Click a source, or click empty canvas to deselect.';
}

export function sourceMeta(source) {
  return [baseMeta(source), transformSummary(source), familyMeta(source), cropSummary(source)].filter(Boolean).join(' · ');
}

function baseMeta(source) {
  return `${source.type} · ${Math.round(source.w)}×${Math.round(source.h)} at ${Math.round(source.x)},${Math.round(source.y)}`;
}
function familyMeta(source) {
  const label = visualizerFamilyLabel(source); return label ? `Visualizer family: ${label}` : '';
}
