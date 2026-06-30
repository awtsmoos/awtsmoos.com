// B"H
import { extensionOf, joinExplorerPath, nameFromPath } from './path.js';
import { mountData, mountBadge } from './mounts.js';
import { permissionForPath } from './permissions.js';

export function normalizeRenderItems(items = [], options = {}) {
  return [...items].map(item => normalizeRenderItem(item, options)).filter(Boolean).sort(sortRenderItems);
}

export function normalizeRenderItem(raw = {}, { currentPath = '/', os } = {}) {
  const name = raw.name || nameFromPath(raw.path || '');
  if (!name || String(name).startsWith('.')) return null;
  const path = raw.path && String(raw.path).startsWith('awtsmoos://') ? raw.path : joinExplorerPath(currentPath, name);
  const kind = itemKind(raw, name);
  const extension = kind === 'folder' ? '' : extensionOf(name);
  const mount = mountData(os, path);
  const permissions = permissionForPath(os, path, mount);
  mount.badge = mountBadge(mount, permissions);
  const iconKind = kind === 'folder' ? 'folder' : extension || raw.type || 'file';
  const classes = ['file-item', `awts-kind-${kind}`, `awts-ext-${extension || 'none'}`, mount.className, mount.locality === 'remote' ? 'remote-file-item' : '', permissions.permission === 'denied' ? 'mount-denied' : ''].filter(Boolean);
  return { id:path, name, path, kind, extension, iconKind, mount, permissions, status:statusFor(raw, mount), classes, data:dataFor(kind, extension, iconKind, mount, permissions), raw };
}

export function sortRenderItems(a, b) {
  return order(a.kind) - order(b.kind) || a.name.localeCompare(b.name, undefined, { numeric:true, sensitivity:'base' });
}

function itemKind(raw, name) {
  const type = String(raw.type || '').toLowerCase();
  if (raw.isDirectory || type === 'directory' || type === 'folder' || String(name).endsWith('.folder')) return 'folder';
  return 'file';
}

function statusFor(raw, mount) {
  return { dirty:!!raw.dirty, pending:!!raw.pending, published:!!raw.published, synced:mount.syncState === 'live' || mount.syncState === 'hosted', remote:mount.locality === 'remote', localOnly:mount.locality !== 'remote' };
}

function dataFor(kind, extension, iconKind, mount, permissions) {
  return { kind, extension, iconKind, locality:mount.locality || 'local', syncState:mount.syncState || 'private', permission:permissions.permission, adapter:mount.adapterId || mount.adapterType || 'virtual' };
}

function order(kind) { return kind === 'folder' ? 0 : 1; }

/** B"H: raw filesystem fact becomes visible OS meaning at this bridge. */
