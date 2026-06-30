// B"H
const REMOTE = 'awtsmoos://';

export function isRemotePath(path = '') {
  return String(path || '').startsWith(REMOTE);
}

export function normalizeExplorerPath(path = '/') {
  const text = String(path || '/').trim() || '/';
  if (isRemotePath(text)) {
    const rest = text.slice(REMOTE.length).split('/').filter(Boolean).join('/');
    return rest ? `${REMOTE}${rest}` : REMOTE;
  }
  return (`/${text.replace(/^\/+/, '')}`).replace(/\/+/g, '/') || '/';
}

export function joinExplorerPath(path = '/', name = '') {
  const base = normalizeExplorerPath(path);
  const tail = String(name || '').split('/').filter(Boolean).join('/');
  if (!tail) return base;
  if (isRemotePath(base)) return `${base.replace(/\/+$/, '')}/${tail}`;
  return normalizeExplorerPath(`${base}/${tail}`);
}

export function parentExplorerPath(path = '/') {
  const value = normalizeExplorerPath(path);
  if (value === '/') return '/';
  if (isRemotePath(value)) {
    const parts = value.slice(REMOTE.length).split('/').filter(Boolean);
    if (parts.length <= 1) return value;
    return `${REMOTE}${parts.slice(0, -1).join('/')}`;
  }
  const parts = value.split('/').filter(Boolean);
  return parts.length <= 1 ? '/' : `/${parts.slice(0, -1).join('/')}`;
}

export function nameFromPath(path = '') {
  const value = normalizeExplorerPath(path);
  const parts = isRemotePath(value) ? value.slice(REMOTE.length).split('/') : value.split('/');
  return parts.filter(Boolean).pop() || '/';
}

export function extensionOf(name = '') {
  const clean = String(name || '').toLowerCase();
  if (!clean || clean.endsWith('.folder')) return '';
  const last = clean.split('/').pop() || clean;
  const dot = last.lastIndexOf('.');
  return dot > 0 ? last.slice(dot + 1).replace(/[^a-z0-9-]/g, '') : '';
}

/** B"H: paths keep the awtsmoos:// covenant; no slash-normalizer may erase a world. */
