// B"H
export function line(text, cls = 'info') { return `<${cls}>${String(text ?? '')}</${cls}>`; }
export function textOf(value) {
  if (typeof value === 'string') return value;
  if (value?.content && typeof value.content === 'string') return value.content;
  try { return JSON.stringify(value, null, 2); } catch { return String(value); }
}
export function table(rows = [], long = false) {
  return rows.map(item => {
    const kind = item.type || item.kind || (item.children ? 'folder' : 'file');
    const name = item.name || item.title || item.path || '';
    const badges = [item.adapter, item.permission, item.locality, item.syncState].filter(Boolean).join(' ');
    return long ? `${kind.padEnd(8)} ${String(item.size ?? '').padStart(6)} ${badges.padEnd(20)} ${name}` : `${kind === 'folder' ? 'dir ' : 'file'} ${name}`;
  }).join('\n') || '(empty)';
}
export function mountTable(mounts = []) { return mounts.map(m => `${m.id || '?'} ${m.prefix || '/'} -> ${m.adapterId || '?'} ${perm(m)}`).join('\n') || '(no mounts)'; }
function perm(m) { return Object.entries(m.permissions || {}).map(([k,v]) => `${k}:${v ? 'y' : 'n'}`).join(' '); }
/** B"H: formatters dress raw VFS fragments in readable console garments. */
