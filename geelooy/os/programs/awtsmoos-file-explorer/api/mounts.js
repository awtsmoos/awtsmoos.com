// B"H
export function classForMount(mountOrAdapter = '') {
  const value = valueOf(mountOrAdapter);
  if (/denied|locked|restricted/i.test(value)) return 'mount-denied';
  if (/preview|receipt/i.test(value)) return 'mount-preview';
  if (/tunnel|remote|live/i.test(value)) return 'mount-tunnel';
  return 'mount-local';
}

export function iconForMount(mount = {}) {
  const value = valueOf(mount);
  if (/denied|locked|restricted/i.test(value)) return '⛔';
  if (/receipt/i.test(value)) return '📜';
  if (/preview/i.test(value)) return '🟣';
  if (/tunnel|remote|live/i.test(value)) return '🌐';
  return '💾';
}

export function labelForMount(mount = {}) {
  return mount.title || mount.name || mount.adapterId || mount.adapterType || 'Local';
}

export function mountBadge(mount = {}, permission = {}) {
  const p = permission.permission || mount.permissionState || 'read-write';
  return `${iconForMount(mount)} ${mount.adapterType || mount.adapterId || 'adapter'} · ${p} · ${mount.locality || 'local'} · ${mount.syncState || 'private'}`;
}

export function resolveMount(os, path = '/') {
  return os?.vfs?.resolve?.(path)?.mount || os?.vfs?.mounts?.()?.[0] || {};
}

export function mountData(os, path = '/', permission = {}) {
  const mount = resolveMount(os, path);
  return { ...mount, className:classForMount(mount), icon:iconForMount(mount), label:labelForMount(mount), badge:mountBadge(mount, permission) };
}

function valueOf(input) {
  return typeof input === 'string' ? input : `${input.adapterId || ''} ${input.adapterType || ''} ${input.kind || ''} ${input.id || ''} ${input.locality || ''} ${input.permissionState || ''}`;
}

/** B"H: mount meaning is shaped once, so UI does not grope in the dark. */
