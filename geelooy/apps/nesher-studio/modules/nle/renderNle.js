/* B"H
The NLE view makes time visible: bin sparks above, timeline vessels below.
*/
import { describeExport } from './exportPlan.js';
import { timelineCommandSummary } from './timelineCommands.js';
import { timelineSummary } from './timeline.js';
export function renderNle(state, dom) {
  const assets = state.bin?.assets || [], tracks = state.timeline?.tracks || [], duration = Math.max(1, state.timeline?.duration || 1);
  dom.nleBin.innerHTML = renderAssets(assets, state);
  dom.nleTimeline.innerHTML = renderTracks(tracks, state, duration);
  if (dom.nleSelectionSummary) dom.nleSelectionSummary.textContent = timelineCommandSummary(state.timeline);
  dom.nleExport.textContent = exportText(state);
}
function renderAssets(assets, state) {
  return assets.map(a => `<li data-asset-id="${safe(a.id)}" class="${a.id === state.bin.selectedAssetId ? 'active' : ''}"><strong>${safe(a.name)}</strong><span>${safe(a.kind)} · ${a.duration || 0}s · ${safe(a.id)}</span></li>`).join('') || '<li><strong>No assets yet</strong><span>bin ready</span></li>';
}
function renderTracks(tracks, state, duration) {
  return tracks.map(t => `<li class="track" data-track-id="${safe(t.id)}"><strong>${safe(t.name)} <small>${safe(t.kind)}</small></strong><div class="clip-lane">${clips(t, state, duration)}</div></li>`).join('') || '<li><strong>No tracks yet</strong><span>timeline ready</span></li>';
}
function clips(track, state, total) {
  return track.clips.map(c => `<button data-clip-id="${safe(c.id)}" class="clip ${c.id === state.timeline.selectedClipId ? 'active' : ''}" style="left:${pct(c.start,total)}%;width:${pct(c.duration,total)}%" title="${safe(c.name)} ${c.start}s-${c.start + c.duration}s">${safe(c.name)} · ${c.start}s</button>`).join('');
}
function exportText(state) {
  const summary = state.timeline ? timelineSummary(state.timeline) : null;
  const base = state.exportPlan ? describeExport(state.exportPlan) : 'WebCodecs export plan pending.';
  return summary ? `${base} | timeline: ${summary.clips} clips / ${summary.duration}s` : base;
}
function pct(v, total) { return Math.max(3, Math.min(100, (Number(v || 0) / total) * 100)); }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
