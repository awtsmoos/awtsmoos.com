/* B"H
The NLE view makes time visible: bin sparks above, timeline vessels below.
*/
import { describeExport } from './exportPlan.js';
export function renderNle(state, dom) {
  const assets = state.bin?.assets || [], tracks = state.timeline?.tracks || [], duration = Math.max(1, state.timeline?.duration || 1);
  dom.nleBin.innerHTML = assets.map(a => `<li data-asset-id="${safe(a.id)}" class="${a.id === state.bin.selectedAssetId ? 'active' : ''}"><strong>${safe(a.name)}</strong><span>${safe(a.kind)} · ${a.duration || 0}s</span></li>`).join('') || '<li><strong>No assets yet</strong><span>bin ready</span></li>';
  dom.nleTimeline.innerHTML = tracks.map(t => `<li class="track"><strong>${safe(t.name)}</strong><div class="clip-lane">${clips(t, state, duration)}</div></li>`).join('') || '<li><strong>No tracks yet</strong><span>timeline ready</span></li>';
  dom.nleExport.textContent = state.exportPlan ? describeExport(state.exportPlan) : 'WebCodecs export plan pending.';
}
function clips(track, state, total) {
  return track.clips.map(c => `<button data-clip-id="${safe(c.id)}" class="clip ${c.id === state.timeline.selectedClipId ? 'active' : ''}" style="left:${pct(c.start,total)}%;width:${pct(c.duration,total)}%">${safe(c.name)} · ${c.start}s</button>`).join('');
}
function pct(v, total) { return Math.max(3, Math.min(100, (Number(v || 0) / total) * 100)); }
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
