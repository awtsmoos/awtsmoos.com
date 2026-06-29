// B"H
import { readRememberedAlias } from '/scripts/awtsmoos/social/localAliasState.js';
import { diagnosticsStyles, openDiagnosticsPopup } from './diagnosticsPopup.js';
export function createOsStatus() { return { mode:'local', label:'Local IndexedDB', detail:'Private browser storage active', remote:'unknown', updatedAt:Date.now() }; }
export function computeOsStatus({ remote = 'unknown' } = {}) {
  const alias = readRememberedAlias(); const mode = alias ? 'synced' : 'local';
  const label = alias ? `Synced Alias @${alias}` : 'Local IndexedDB';
  const detail = remote === 'needs-login' ? 'Remote drives need reconnect' : mode === 'synced' ? 'Alias URLs enabled' : 'Files stay in this browser';
  return { mode, label, detail, remote, alias, updatedAt:Date.now() };
}
export function renderStatusPill(status, os) {
  let pill = document.querySelector('.awtsmoos-status-pill');
  if (!pill) { pill = document.createElement('button'); pill.type = 'button'; pill.className = 'awtsmoos-status-pill'; pill.title = 'Open Awtsmoos OS diagnostics'; document.querySelector('.awtsmoos-top-header')?.prepend(pill); }
  pill.dataset.mode = status.mode; pill.dataset.remote = status.remote || 'unknown'; pill.setAttribute('data-diagnostics', 'available');
  pill.innerHTML = `<span class="status-dot"></span><span>${escapeHtml(status.label)}</span><small>${escapeHtml(status.detail)}</small>`;
  pill.onclick = () => { os?.recordGraphEvent?.('diagnostics.open', { source:'status-pill' }); openDiagnosticsPopup(os, status); };
  return pill;
}
export function statusStyles() { return `.awtsmoos-status-pill{display:inline-flex;align-items:center;gap:7px;border:1px solid rgba(125,211,252,.35);border-radius:999px;background:rgba(8,20,34,.72);color:#dff6ff;padding:5px 10px;font-size:12px;box-shadow:0 0 18px rgba(14,165,233,.18);backdrop-filter:blur(12px);cursor:pointer}.awtsmoos-status-pill small{opacity:.72;font-size:10px}.awtsmoos-status-pill .status-dot{width:8px;height:8px;border-radius:999px;background:#22c55e;box-shadow:0 0 10px #22c55e}.awtsmoos-status-pill[data-mode=local] .status-dot{background:#f59e0b;box-shadow:0 0 10px #f59e0b}.awtsmoos-status-pill[data-remote=needs-login]{border-color:rgba(245,158,11,.55)}${diagnosticsStyles()}`; }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: the status pill now opens diagnostics and declares data-diagnostics plainly. */
