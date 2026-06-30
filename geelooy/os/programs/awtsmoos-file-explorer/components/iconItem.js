// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';
import { itemAttrs, escapeHtml } from './fileItem.js';
export default function iconItem({ item, selected = false, events = {} }) {
  const el = createElement({ tag:'div', attributes:itemAttrs(item, selected, 'icon'), children:[
    { tag:'div', attributes:{ class:'icon-img', 'data-icon-kind':item.iconKind }, html:getIconForName(item.name, item.kind === 'folder') },
    { tag:'span', attributes:{ class:'file-name' }, html:escapeHtml(item.name) },
    { tag:'small', attributes:{ class:'item-meta' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || 'file') },
    { tag:'small', attributes:{ class:'mount-badge' }, html:escapeHtml(item.mount.badge) }
  ], on:clean(events) }); el.awtsmoosRenderItem = item; return el;
}
function clean(events = {}) { return Object.fromEntries(Object.entries(events).filter(([, fn]) => typeof fn === 'function')); }
/** B"H: The icon tile is a whole clickable vessel, glyph and label together. */
