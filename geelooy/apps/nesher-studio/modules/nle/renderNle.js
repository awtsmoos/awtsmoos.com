/* B"H
 * NLE renderer: bin, real timeline ruler, playhead, tracks, and export summary.
 */
import { describeExport } from './exportPlan.js';
import { timelineCommandSummary } from './timelineCommands.js';
import { timelineSummary } from './timeline.js';
import { timelineHtml } from './timelineMarkup.js';
import { buildTimelineView } from './timelineViewModel.js';

export function renderNle(state, dom) {
  const assets = state.bin?.assets || [];
  dom.nleBin.innerHTML = renderAssets(assets, state);
  dom.nleTimeline.innerHTML = timelineHtml(buildTimelineView(state.timeline));
  if (dom.nleSelectionSummary) dom.nleSelectionSummary.textContent = timelineCommandSummary(state.timeline);
  dom.nleExport.textContent = exportText(state);
}

function renderAssets(assets, state) {
  return assets.map(a => `<li data-asset-id="${safe(a.id)}" class="${a.id === state.bin.selectedAssetId ? 'active' : ''}"><strong>${safe(a.name)}</strong><span>${safe(a.kind)} · ${a.duration || 0}s · ${safe(a.id)}</span></li>`).join('') || '<li><strong>No assets yet</strong><span>bin ready</span></li>';
}
function exportText(state) {
  const summary = state.timeline ? timelineSummary(state.timeline) : null;
  const base = state.exportPlan ? describeExport(state.exportPlan) : 'WebCodecs export plan pending.';
  return summary ? `${base} | timeline: ${summary.clips} clips / ${summary.duration}s · playhead ${summary.playhead}s · zoom ${summary.zoom}×` : base;
}
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
