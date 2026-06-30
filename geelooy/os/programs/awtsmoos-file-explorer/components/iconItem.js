// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';
import { itemAttrs, escapeHtml } from './fileItem.js';
export default function iconItem({ item, selected = false, events = {} }) {
  const attrs = { ...itemAttrs(item, selected, 'icon'), role:'gridcell', 'aria-selected':String(selected), 'data-xp-role':'icon-tile' };
  const el = createElement({ tag:'div', attributes:attrs, children:[
    { tag:'div', attributes:{ class:'icon-img', 'data-icon-kind':item.iconKind }, html:getIconForName(item.name, item.kind === 'folder') },
    { tag:'span', attributes:{ class:'file-name' }, html:escapeHtml(item.name) },
    { tag:'small', attributes:{ class:'item-meta' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || 'file') },
    { tag:'small', attributes:{ class:'mount-badge xp-badge' }, html:escapeHtml(item.mount.badge) }
  ], on:clean(events) }); el.awtsmoosRenderItem = item; return el;
}
function clean(events = {}) { return Object.fromEntries(Object.entries(events).filter(([, fn]) => typeof fn === 'function')); }
/** B"H: Icon tiles now expose XP role and selected state for true desktop feel. */
