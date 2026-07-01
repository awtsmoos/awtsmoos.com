// B"H
import { getIconForName } from '../utils/icons.js';
import iconItem from './iconItem.js';
import detailsRow from './detailsRow.js';
export default function createFileItem({ item, selected = false, events = {}, viewMode = 'icons' }) {
  void getIconForName; return viewMode === 'details' ? detailsRow({ item, selected, events }) : iconItem({ item, selected, events });
}
export function itemAttrs(item = {}, selected, mode = 'icon') {
  const name = displayName(item), mount = item.mount || {}, data = item.data || {}, permissions = item.permissions || {};
  return { class:[...(item.classes || []), selected ? 'selected' : '', `file-item-${mode}`].filter(Boolean).join(' '), role:'button', tabindex:'0', draggable:String(!!permissions.canWrite), title:`${name}\n${item.path || ''}\n${mount.badge || ''}`, 'aria-label':`${item.kind || data.kind || 'item'}: ${name}`, 'data-path':item.path || '', 'data-kind':data.kind || item.kind || '', 'data-extension':data.extension || item.extension || '', 'data-locality':data.locality || '', 'data-sync-state':data.syncState || '', 'data-permission':data.permission || '', 'data-adapter':data.adapter || '', 'data-icon-kind':data.iconKind || item.iconKind || '' };
}
export function displayName(item = {}) {
  const raw = item.name ?? item.title ?? item.label ?? item.id ?? item.path?.split('/').filter(Boolean).pop() ?? 'Untitled';
  if (typeof raw === 'string' || typeof raw === 'number') return String(raw);
  return raw?.name || raw?.title || raw?.label || raw?.id || item.path?.split('/').filter(Boolean).pop() || 'Untitled';
}
export function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: file names are now purified before they enter the DOM; no object becomes [object Object]. */
