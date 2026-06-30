/* B"H
The NLE view makes time visible: markers, muted clips, fades, and tracks speak clearly.
*/
import { describeExport } from './exportPlan.js';
import { timelineCommandSummary } from './timelineCommands.js';
import { timelineSummary } from './timeline.js';
export function renderNle(state, dom) {
  const assets = state.bin?.assets || [], tracks = state.timeline?.tracks || [], duration = visibleDuration(state.timeline);
  dom.nleBin.innerHTML = renderAssets(assets, state);
  dom.nleTimeline.innerHTML = renderMarkers(state.timeline, duration) + renderTracks(tracks, state, duration);
  if (dom.nleSelectionSummary) dom.nleSelectionSummary.textContent = timelineCommandSummary(state.timeline);
  dom.nleExport.textContent = exportText(state);
}
function renderAssets(assets, state) {
  return assets.map(a => `<li data-asset-id="${safe(a.id)}" class="${a.id === state.bin.selectedAssetId ? 'active' : ''}"><strong>${safe(a.name)}</strong><span>${safe(a.kind)} · ${a.duration || 0}s · ${safe(a.id)}</span></li>`).join('') || '<li><strong>No assets yet</strong><span>bin ready</span></li>';
}
function renderMarkers(timeline, duration) {
  const markers = timeline?.markers || [];
  if (!markers.length) return '<li class="marker-track"><strong>Markers</strong><span>No markers yet</span></li>';
  return `<li class="marker-track"><strong>Markers</strong><div class="clip-lane">${markers.map(m => `<i class="marker" style="left:${pct(m.at,duration)}%" title="${safe(m.label)} @ ${m.at}s">◆</i>`).join('')}</div></li>`;
}
function renderTracks(tracks, state, duration) {
  return tracks.map(t => `<li class="track" data-track-id="${safe(t.id)}"><strong>${safe(t.name)} <small>${safe(t.kind)}</small></strong><div class="clip-lane">${clips(t, state, duration)}</div></li>`).join('') || '<li><strong>No tracks yet</strong><span>timeline ready</span></li>';
}
function clips(track, state, total) {
  return track.clips.map(c => `<button data-clip-id="${safe(c.id)}" class="clip ${clipClass(c, state)}" style="left:${pct(c.start,total)}%;width:${pct(c.duration,total)}%" title="${safe(clipTitle(c))}">${safe(clipLabel(c))}</button>`).join('');
}
function exportText(state) {
  const summary = state.timeline ? timelineSummary(state.timeline) : null;
  const base = state.exportPlan ? describeExport(state.exportPlan) : 'WebCodecs export plan pending.';
  return summary ? `${base} | timeline: ${summary.clips} clips / ${summary.duration}s` : base;
}
function visibleDuration(timeline) { return Math.max(1, timeline?.duration || 1, ...(timeline?.markers || []).map(m => m.at + 1)); }
function clipClass(c, state) { return [c.id === state.timeline.selectedClipId ? 'active' : '', c.muted ? 'muted' : '', c.disabled ? 'disabled' : '', c.fadeIn || c.fadeOut ? 'faded' : ''].join(' '); }
function clipLabel(c) { return `${c.name}${c.muted ? ' 🔇' : ''}${c.disabled ? ' off' : ''} · ${c.start}s`; }
function clipTitle(c) { return `${c.name} ${c.start}s-${c.start + c.duration}s fade ${c.fadeIn || 0}/${c.fadeOut || 0}`; }
function pct(v, total) { return Math.max(3, Math.min(100, (Number(v || 0) / total) * 100)); }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
