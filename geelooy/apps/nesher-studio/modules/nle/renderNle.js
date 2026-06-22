/* B"H
The renderer tolerates half-built worlds and still reveals the next vessel.
*/
import { describeExport } from './exportPlan.js';
export function renderNle(state, dom) {
  const assets = state.bin?.assets || [];
  const tracks = state.timeline?.tracks || [];
  dom.nleBin.innerHTML = assets.length ? assets.map(asset => `<li><strong>${safe(asset.name)}</strong><span>${safe(asset.kind)}</span></li>`).join('') : '<li><strong>No assets yet</strong><span>bin ready</span></li>';
  dom.nleTimeline.innerHTML = tracks.length ? tracks.map(track => `<li><strong>${safe(track.name)}</strong><span>${track.clips.length} clip(s)</span></li>`).join('') : '<li><strong>No tracks yet</strong><span>timeline ready</span></li>';
  dom.nleExport.textContent = state.exportPlan ? describeExport(state.exportPlan) : 'WebCodecs export plan pending.';
}
function safe(value) { return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c])); }
