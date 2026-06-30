// B"H
/**
 * Opens the small evidence court that hangs beneath the OS status crown.
 * The Awtsmoos breathes the graph, the VFS, the tunnel, and the local browser
 * memory into one visible scroll, with every newline kept as an explicit glyph
 * so Chrome never mistakes the poem for broken syntax again.
 */
export function openDiagnosticsPopup(os, status = {}) {
  document.querySelector('.awtsmoos-diagnostics-popover')?.remove();

  const pop = document.createElement('div');
  pop.className = 'awtsmoos-diagnostics-popover';
  pop.innerHTML = headerHtml();
  pop.append(...diagnosticSections(os, status));

  pop.querySelector('button').onclick = () => pop.remove();
  document.body.appendChild(pop);
  return pop;
}

function headerHtml() {
  return `<header><b>Awtsmoos OS Diagnostics</b><button aria-label="Close">×</button></header>`;
}

function diagnosticSections(os, status) {
  return [
    section('Local IndexedDB', indexedDbText(status)),
    section('Alias', status.alias || 'No alias selected'),
    section('Login status', loginText(status)),
    section('Tunnel status', tunnelText(status)),
    section('Mounted drives', mountedDrivesText(os)),
    section('Graph statistics', graphStatisticsText(os)),
    section('Last sync', lastSyncText(os)),
    section('Pending operations', pendingOperationsText(os))
  ];
}

function indexedDbText(status) {
  return status.mode === 'local'
    ? 'Active private browser storage'
    : 'Active, synced alias available';
}

function loginText(status) {
  return status.alias ? 'Logged in / alias remembered' : 'Local mode / reconnect needed';
}

function tunnelText(status) {
  return globalThis.VirtualOSTunnelAgent ? 'Virtual OS tunnel bridge available' : (status.remote || 'unknown');
}

function mountedDrivesText(os) {
  const mounts = os?.vfs?.mounts?.() || [];
  if (!mounts.length) return 'None';
  return mounts.map(mountLine).join('\n');
}

function mountLine(mount = {}) {
  const id = mount.id || 'mount';
  const adapter = mount.adapterId || 'adapter';
  const prefix = mount.prefix || '/';
  const sync = mount.syncState || 'local';
  return `${id} · ${adapter} · ${prefix} · ${sync}`;
}

function graphStatisticsText(os) {
  const objects = os?.graph?.list?.().length || 0;
  const events = os?.graph?.history?.({ limit: 200 })?.length || 0;
  return `${objects} objects\n${events} recent events`;
}

function lastSyncText(os) {
  return os?.lastSyncAt ? new Date(os.lastSyncAt).toLocaleString() : 'Never';
}

function pendingOperationsText(os) {
  const pending = os?.pendingOperations || [];
  if (!pending.length) return 'None';
  return pending.map(item => `${item.type}:${item.path}`).join('\n');
}

function section(title, body) {
  const el = document.createElement('section');
  el.innerHTML = `<h4>${escapeHtml(title)}</h4><pre>${escapeHtml(body)}</pre>`;
  return el;
}

function escapeHtml(value) {
  return String(value || '').replace(/[&<>]/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }[char]));
}

export function diagnosticsStyles() {
  return `.awtsmoos-diagnostics-popover{position:fixed;top:56px;left:18px;z-index:999999;width:min(430px,calc(100vw - 24px));max-height:78vh;overflow:auto;border:1px solid rgba(125,211,252,.38);border-radius:16px;background:rgba(5,12,24,.94);color:#dff6ff;box-shadow:0 24px 70px rgba(0,0,0,.45);padding:12px}.awtsmoos-diagnostics-popover header{display:flex;justify-content:space-between;align-items:center;gap:10px}.awtsmoos-diagnostics-popover button{border:0;border-radius:999px;background:rgba(255,255,255,.12);color:inherit;padding:2px 9px}.awtsmoos-diagnostics-popover section{margin-top:10px;padding:9px;border-radius:12px;background:rgba(14,165,233,.08);border:1px solid rgba(125,211,252,.15)}.awtsmoos-diagnostics-popover h4{margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.08em}.awtsmoos-diagnostics-popover pre{margin:0;white-space:pre-wrap;font-size:12px;line-height:1.35}`;
}

/** B"H: the status crown opens into a little court of evidence. */
