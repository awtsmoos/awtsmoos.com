// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { getIconForName } from '../utils/icons.js';

export default function createFileItem({ item, selected = false, events = {} }) {
  const el = createElement({ tag:'div', attributes:itemAttrs(item, selected), children:itemChildren(item), on:cleanEvents(events) });
  el.awtsmoosRenderItem = item;
  return el;
}

function itemAttrs(item, selected) {
  return {
    class:[...item.classes, selected ? 'selected' : ''].filter(Boolean).join(' '), role:'button', tabindex:'0', draggable:String(item.permissions.canWrite), title:item.mount.badge, 'aria-label':`${item.kind}: ${item.name}`,
    'data-path':item.path, 'data-kind':item.data.kind, 'data-extension':item.data.extension, 'data-locality':item.data.locality, 'data-sync-state':item.data.syncState, 'data-permission':item.data.permission, 'data-adapter':item.data.adapter, 'data-icon-kind':item.data.iconKind
  };
}
function itemChildren(item) {
  return [
    { tag:'div', attributes:{ class:'icon-img', 'data-icon-kind':item.iconKind }, html:getIconForName(item.name, item.kind === 'folder') },
    { tag:'span', attributes:{ class:'file-name' }, html:escapeHtml(item.name) },
    { tag:'small', attributes:{ class:'item-meta' }, html:escapeHtml(item.kind === 'folder' ? 'folder' : item.extension || 'file') },
    { tag:'small', attributes:{ class:'mount-badge' }, html:escapeHtml(item.mount.badge) }
  ];
}
function cleanEvents(events = {}) { return Object.fromEntries(Object.entries(events).filter(([, fn]) => typeof fn === 'function')); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }

/** B"H: every semantic data hook is literal, testable, focusable, and clickable. */
