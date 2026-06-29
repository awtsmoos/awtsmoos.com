// B"H
export function parseAwtsmoosPath(path = '') {
  const text = String(path || '');
  if (!text.startsWith('awtsmoos://')) return { kind:'local', path:text };
  const rest = text.slice('awtsmoos://'.length);
  const [kind, id, ...tail] = rest.split('/');
  return { kind, id:id || '', innerPath:tail.join('/') || '.', raw:text };
}
export function isRemote(path = '') { return String(path || '').startsWith('awtsmoos://'); }
