// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';

export default function createFileItem({ item, selected = false, events = {} }) {
  const attrs = { class:[...item.classes, selected ? 'selected' : ''].filter(Boolean).join(' '), draggable:String(item.permissions.canWrite), 'data-path':item.path, title:item.mount.badge };
  for (const [key, value] of Object.entries(item.data)) attrs[`data-${dash(key)}`] = value;
  const el = createElement({ tag:'div', attributes:attrs, children:[
    { tag:'div', attributes:{ class:'icon-img', 'data-icon-kind':item.iconKind }, html:getIconForName(item.name, item.kind === 'folder') },
    { tag:'span', attributes:{ class:'file-name' }, html:escapeHtml(item.name) },
    { tag:'small', attributes:{ class:'item-meta' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || 'file') },
    { tag:'small', attributes:{ class:'mount-badge' }, html:escapeHtml(item.mount.badge) }
  ], on:events });
  el.awtsmoosRenderItem = item;
  return el;
}

function dash(key) { return String(key).replace(/[A-Z]/g, x => `-${x.toLowerCase()}`); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: each item is a rendered vessel with stable hooks and no hidden guesses. */
