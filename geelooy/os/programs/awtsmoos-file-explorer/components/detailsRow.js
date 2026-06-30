// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';
import { itemAttrs, escapeHtml } from './fileItem.js';
export default function detailsRow({ item, selected = false, events = {} }) {
  const attrs = { ...itemAttrs(item, selected, 'details'), role:'row', 'aria-selected':String(selected), 'data-xp-role':'details-row', 'data-xp-frame':'sunken' };
  const el = createElement({ tag:'div', attributes:attrs, children:[
    { tag:'span', attributes:{ class:'details-name', role:'gridcell' }, html:`<span class="small-icon" data-icon-kind="${item.iconKind}">${getIconForName(item.name, item.kind === 'folder')}</span><span class="file-name">${escapeHtml(item.name)}</span>` },
    { tag:'span', attributes:{ class:'item-meta', role:'gridcell' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || 'file') },
    { tag:'span', attributes:{ class:'mount-badge xp-badge', role:'gridcell' }, html:escapeHtml(item.mount.badge) },
    { tag:'span', attributes:{ class:'details-permission xp-status-field', role:'gridcell' }, html:escapeHtml(item.data.permission || 'read') },
    { tag:'span', attributes:{ class:'details-status xp-status-field', role:'gridcell' }, html:escapeHtml(item.data.syncState || item.data.locality || 'ready') }
  ], on:clean(events) }); el.awtsmoosRenderItem = item; return el;
}
function clean(events = {}) { return Object.fromEntries(Object.entries(events).filter(([, fn]) => typeof fn === 'function')); }
/** B"H: Details rows now carry XP badge/status cells without losing VFS data hooks. */
