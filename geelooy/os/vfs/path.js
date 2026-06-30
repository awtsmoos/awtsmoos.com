// B"H
const REMOTE = 'awtsmoos://';
export function isRemotePath(path = '') { return String(path || '').startsWith(REMOTE); }
export function normalizePath(path = '/') { const text = String(path || '/'); if (isRemotePath(text)) return REMOTE + text.slice(REMOTE.length).split('/').filter(Boolean).join('/'); return ('/' + text.replace(/^\/+/, '')).replace(/\/+/g, '/'); }
export function joinPath(...parts) { const first = String(parts[0] || '/'); if (isRemotePath(first)) return `${normalizePath(first).replace(/\/+$/, '')}/${parts.slice(1).join('/').split('/').filter(Boolean).join('/')}`; return normalizePath(parts.join('/')); }
export function basename(path = '') { return normalizePath(path).split('/').filter(Boolean).pop() || '/'; }

/** B"H: VFS paths preserve hosted schemes instead of crushing them into local slash roads. */
