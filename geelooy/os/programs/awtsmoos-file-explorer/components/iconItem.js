// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';
import { itemAttrs, escapeHtml, displayName } from './fileItem.js';
export default function iconItem({ item, selected = false, events = {} }) {
  const name = displayName(item), mount = item.mount || {};
  const attrs = { ...itemAttrs(item, selected, 'icon'), role:'gridcell', 'aria-selected':String(selected), 'data-xp-role':'icon-tile' };
  const el = createElement({ tag:'div', attributes:attrs, children:[
    { tag:'div', attributes:{ class:'icon-img', 'data-icon-kind':item.iconKind || item.data?.iconKind || '' }, html:getIconForName(name, item.kind === 'folder') },
    { tag:'span', attributes:{ class:'file-name' }, html:escapeHtml(name) },
    { tag:'small', attributes:{ class:'item-meta' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || item.data?.extension || 'file') },
    { tag:'small', attributes:{ class:'mount-badge xp-badge' }, html:escapeHtml(mount.badge || '') }
  ], on:clean(events) }); el.awtsmoosRenderItem = item; return el;
}
function clean(events = {}) { return Object.fromEntries(Object.entries(events).filter(([, fn]) => typeof fn === 'function')); }
/** B"H: Icon tiles reveal clean names, even when IndexedDB hands back strange vessels. */
