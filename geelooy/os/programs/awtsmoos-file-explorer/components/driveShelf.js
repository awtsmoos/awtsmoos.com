// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { classForMount, iconForMount, labelForMount, mountBadge } from '../utils/mountClass.js';

export default function driveShelf({ os, onNavigate }) {
  const shelf = createElement({ tag:'div', attributes:{ class:'drive-shelf', 'aria-label':'Mounted worlds' } });
  shelf.append(...mounts(os).map(m => mountChip(os, m, onNavigate)));
  return shelf;
}

function mounts(os) {
  const vfs = os?.vfs?.mounts?.() || [];
  const drives = (os?.drives?.list?.() || []).map(d => ({ id:d.id, prefix:d.root, title:d.title, icon:d.icon, adapterId:d.kind || 'drive', adapterType:d.vesselType || d.kind || 'drive', locality:d.kind === 'remote' || d.kind === 'preview' ? 'remote' : 'local', syncState:d.kind === 'remote' ? 'live' : 'private', permissionState:d.writable === false ? 'read-only' : 'read-write' }));
  const seen = new Set();
  return [...vfs, ...drives].filter(m => { const key = m.prefix || m.root; if (seen.has(key)) return false; seen.add(key); return true; });
}

function mountChip(os, mount, onNavigate) {
  const permission = os?.vfs?.can?.(mount.prefix, 'read') || {};
  const title = mountBadge(mount, permission);
  return createElement({ tag:'button', attributes:{ class:`drive-chip ${classForMount(mount)}`, title, 'data-adapter':mount.adapterId || mount.adapterType, 'data-permission':mount.permissionState || 'read-write', 'data-sync-state':mount.syncState || 'private', 'data-locality':mount.locality || 'local' }, children:[
    { tag:'span', attributes:{ class:'drive-chip-icon' }, html:iconForMount(mount) },
    { tag:'span', attributes:{ class:'drive-chip-label' }, html:escapeHtml(labelForMount(mount)) },
    { tag:'small', attributes:{ class:'drive-chip-meta' }, html:escapeHtml(`${mount.permissionState || 'read-write'} · ${mount.locality || 'local'}`) }
  ], on:{ click:() => onNavigate(mount.prefix) } });
}
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: drive chips are mounted worlds with readable weather, not overlapping ghosts. */
