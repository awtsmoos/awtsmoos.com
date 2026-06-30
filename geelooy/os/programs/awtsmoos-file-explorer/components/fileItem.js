// B"H
import iconItem from './iconItem.js';
import detailsRow from './detailsRow.js';
export default function createFileItem({ item, selected = false, events = {}, viewMode = 'icons' }) { return viewMode === 'details' ? detailsRow({ item, selected, events }) : iconItem({ item, selected, events }); }
export function itemAttrs(item, selected, mode = 'icon') { return { class:[...item.classes, selected ? 'selected' : '', `file-item-${mode}`].filter(Boolean).join(' '), role:'button', tabindex:'0', draggable:String(item.permissions.canWrite), title:`${item.name}\n${item.path}\n${item.mount.badge}`, 'aria-label':`${item.kind}: ${item.name}`, 'data-path':item.path, 'data-kind':item.data.kind, 'data-extension':item.data.extension, 'data-locality':item.data.locality, 'data-sync-state':item.data.syncState, 'data-permission':item.data.permission, 'data-adapter':item.data.adapter, 'data-icon-kind':item.data.iconKind }; }
export function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: Compatibility remains, but presentation splits into small vessels. */
