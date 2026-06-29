// B"H
export function openDiagnosticsPopup(os, status = {}) {
  document.querySelector('.awtsmoos-diagnostics-popover')?.remove();
  const pop = document.createElement('div'); pop.className = 'awtsmoos-diagnostics-popover';
  const graphHistory = os?.graph?.history?.({ limit:200 }) || [];
  const mounts = os?.vfs?.mounts?.() || []; const drives = os?.drives?.list?.() || [];
  pop.innerHTML = `<header><b>Awtsmoos OS Diagnostics</b><button aria-label="Close">×</button></header>`;
  pop.append(
    section('Local IndexedDB', status.mode === 'local' ? 'Active private browser storage' : 'Active, synced alias available'),
    section('Alias', status.alias || 'No alias selected'),
    section('Login status', status.alias ? 'Logged in / alias remembered' : 'Local mode / reconnect needed'),
    section('Tunnel status', window.VirtualOSTunnelAgent ? 'Virtual OS tunnel bridge available' : (status.remote || 'unknown')),
    section('Mounted drives', mounts.map(m => `${m.id} · ${m.adapterId} · ${m.prefix} · ${m.syncState || 'local'}`).join('
') || 'None'),
    section('Graph statistics', `${os?.graph?.list?.().length || 0} objects
${graphHistory.length} recent events`),
    section('Last sync', os?.lastSyncAt ? new Date(os.lastSyncAt).toLocaleString() : 'Never'),
    section('Pending operations', (os?.pendingOperations || []).map(x => `${x.type}:${x.path}`).join('
') || 'None')
  );
  pop.querySelector('button').onclick = () => pop.remove(); document.body.appendChild(pop); return pop;
}
function section(title, body) { const el = document.createElement('section'); el.innerHTML = `<h4>${escapeHtml(title)}</h4><pre>${escapeHtml(body)}</pre>`; return el; }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
export function diagnosticsStyles() { return `.awtsmoos-diagnostics-popover{position:fixed;top:56px;left:18px;z-index:999999;width:min(430px,calc(100vw - 24px));max-height:78vh;overflow:auto;border:1px solid rgba(125,211,252,.38);border-radius:16px;background:rgba(5,12,24,.94);color:#dff6ff;box-shadow:0 24px 70px rgba(0,0,0,.45);padding:12px}.awtsmoos-diagnostics-popover header{display:flex;justify-content:space-between;align-items:center;gap:10px}.awtsmoos-diagnostics-popover button{border:0;border-radius:999px;background:rgba(255,255,255,.12);color:inherit;padding:2px 9px}.awtsmoos-diagnostics-popover section{margin-top:10px;padding:9px;border-radius:12px;background:rgba(14,165,233,.08);border:1px solid rgba(125,211,252,.15)}.awtsmoos-diagnostics-popover h4{margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.awtsmoos-diagnostics-popover pre{margin:0;white-space:pre-wrap;font-size:12px;line-height:1.35}`; }
/** B"H: the status crown opens into a little court of evidence. */
