// B"H
export function resolvePath(cwd = '/', value = '') {
  const raw = String(value || '').trim();
  if (!raw || raw === '.') return cwd || '/';
  if (raw.startsWith('awtsmoos://')) return raw.replace(/\/$/, '');
  if (raw.startsWith('/')) return clean(raw);
  return clean(`${cwd || '/'}/${raw}`);
}
export function dirname(path = '/') {
  if (path.startsWith('awtsmoos://')) return path.split('/').slice(0, -1).join('/') || path;
  const parts = clean(path).split('/').filter(Boolean); parts.pop(); return `/${parts.join('/')}` || '/';
}
export function basename(path = '') { return String(path).replace(/\/$/, '').split('/').pop() || '/'; }
function clean(path) {
  const parts = [];
  for (const part of String(path || '/').split('/')) {
    if (!part || part === '.') continue;
    if (part === '..') parts.pop(); else parts.push(part);
  }
  return `/${parts.join('/')}` || '/';
}
/** B"H: paths are ladders; dot, slash, and dot-dot become orderly rungs. */
