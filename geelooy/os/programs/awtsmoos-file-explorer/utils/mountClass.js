// B"H
export function classForMount(mountOrAdapter = '') { const value = valueOf(mountOrAdapter); if (/tunnel|remote/i.test(value)) return 'mount-tunnel'; if (/preview|receipt/i.test(value)) return 'mount-preview'; if (/denied|locked|restricted/i.test(value)) return 'mount-denied'; return 'mount-local'; }
export function labelForMount(mount = {}) { return mount.title || mount.name || mount.adapterId || 'Local'; }
export function mountBadge(mount = {}, permission = {}) { return `${iconForMount(mount)} ${mount.adapterType || mount.adapterId || 'adapter'} · ${permission.ok === false ? 'denied' : mount.permissionState || 'read-write'} · ${mount.locality || 'local'} · ${mount.syncState || 'private'}`; }
export function iconForMount(mount = {}) { const value = valueOf(mount); if (/tunnel|remote/i.test(value)) return '🌐'; if (/preview/i.test(value)) return '🟣'; if (/receipt/i.test(value)) return '📜'; return '💾'; }
function valueOf(input) { return typeof input === 'string' ? input : `${input.adapterId || ''} ${input.kind || ''} ${input.id || ''} ${input.locality || ''}`; }
/** B"H: every mount badge tells adapter, permission, local/remote, and sync state. */
