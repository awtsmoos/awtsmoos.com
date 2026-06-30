// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDrop.js';
import { showContextMenu } from '/os/contextMenuManager.js';
import { getIconForName } from '../utils/icons.js';
import { classForMount, mountBadge } from '../utils/mountClass.js';
import * as RemoteFs from '/os/remote/remoteFs.js';

export default function createFileView(args) {
  const { state, os, onNavigate, onRefresh, system, onEnterSelectionMode, onExitSelectionMode } = args;
  const body = createElement({ tag: 'div', attributes: { class: 'file-explorer-body' }, on: dropEvents(state, os, system, onRefresh) });
  async function itemsForPath() { if (state.remoteMode) return await RemoteFs.list(os, state.currentPath); const nodes = await os.vfs.list(vfsPath(state.currentPath)); return nodes.map(nodeToItem).filter(visible); }
  async function render() { body.innerHTML = ''; body.className = `file-explorer-body ${state.viewMode}-view ${currentMountClass()}`; try { drawItems(await itemsForPath()); } catch (error) { body.innerHTML = `<div class="remote-folder-state">${escapeHtml(error.message)}</div>`; } }
  function drawItems(items) { const sorted = items.sort(compareItems); if (!sorted.length) body.innerHTML = `<div class="empty-folder-state semantic-empty-state ${currentMountClass()}">Folder is empty · ${escapeHtml(currentMountTitle())}</div>`; else sorted.forEach(renderItem); }
  function renderItem(item) { body.appendChild(itemElement(item)); }
  function itemElement(item) {
    const name = item.name, folder = isFolder(item), full = item.path || joinVfsPath(state.currentPath, name);
    const mount = currentMount(full), permission = state.remoteMode ? {} : (os?.vfs?.can?.(vfsPath(full), 'read') || {});
    return createElement({ tag: 'div', attributes: itemAttributes(name, folder, full, mount, permission), children: itemChildren(name, folder, mount, permission), on: itemEvents(name, folder, full, item) });
  }
  function itemAttributes(name, folder, full, mount, permission) {
    const ext = extensionOf(name), kind = folder ? 'folder' : 'file';
    const classes = ['file-item', 'icon', `awts-kind-${kind}`, `awts-ext-${ext || 'none'}`, state.remoteMode ? 'remote-file-item' : '', classForMount(mount)].filter(Boolean).join(' ');
    return { class: classes, draggable: String(!state.remoteMode), 'data-path': full, 'data-kind': kind, 'data-extension': ext, 'data-locality': mount.locality || 'local', 'data-sync-state': mount.syncState || 'private', 'data-permission': permission.ok === false ? 'denied' : mount.permissionState || 'read-write', title: mountBadge(mount, permission) };
  }
  function itemChildren(name, folder, mount, permission) { return [{ tag: 'div', attributes: { class: 'icon-img' }, html: getIconForName(name, folder) }, { tag: 'span', attributes: { class: 'file-name' }, html: escapeHtml(name) }, { tag: 'small', attributes: { class: 'item-meta' }, html: folder ? 'folder' : escapeHtml(extensionOf(name) || 'file') }, { tag: 'small', attributes: { class: 'mount-badge' }, html: escapeHtml(mountBadge(mount, permission)) }]; }
  function itemEvents(name, folder, full, item) { return { dragstart: e => handleDragStart(e, full, body.querySelector(`[data-path="${cssEscape(full)}"]`)?.classList.contains('selected'), body), dragover: folder ? handleDragOver : null, dragleave: folder ? handleDragLeave : null, drop: folder ? e => handleDrop(e, full, os, system, onRefresh) : null, click: e => clickItem(e, name, folder, full, item), contextmenu: e => context(e, name, folder, full) }; }
  function clickItem(event, name, folder, full, item) { event.stopPropagation(); const el = event.currentTarget; state.selectionMode ? select(el) : performOpen(state.currentPath, name, folder, item); }
  async function performOpen(path, item, folder, meta = {}) { if (state.remoteMode) return remoteOpen(meta, path, item, folder); const full = joinVfsPath(path, item); if (folder) return onNavigate(full); const got = await os.vfs.read(full); os.addWindow({ title: item, content: got.content, path, os }); }
  async function remoteOpen(meta, path, item, folder) { if (meta.action === 'openPreview' && meta.url) { os?.recordGraphEvent?.('file.preview', { path: meta.url }); return window.open(meta.url, '_blank', 'noopener'); } if (meta.path) return onNavigate(meta.path); const full = path.endsWith('/') ? path + item : `${path}/${item}`; if (folder) return onNavigate(full); const got = await RemoteFs.read(full); os.addWindow({ title: item, content: got.content || got.body || got.error || JSON.stringify(got, null, 2), path: full, os }); }
  function context(event, title, folder, full) { if (state.remoteMode) return; const el = event.currentTarget; if (!state.selectionMode) { body.querySelectorAll('.selected').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); } showContextMenu({ os, event, path: state.currentPath, title, isFolder: folder, onRefresh, onOpen: () => performOpen(state.currentPath, title, folder), onEnterSelectionMode: () => onEnterSelectionMode(full) }); }
  function currentMount(path = state.currentPath) { return os?.vfs?.resolve?.(vfsPath(path))?.mount || {}; }
  function currentMountClass() { return classForMount(currentMount()); }
  function currentMountTitle() { return currentMount().title || 'Local mount'; }
  function select(el) { el.classList.toggle('selected'); if (!body.querySelectorAll('.selected').length) onExitSelectionMode(); }
  return { dom: body, render };
}
function dropEvents(state, os, system, onRefresh) { return { dragover: handleDragOver, dragleave: handleDragLeave, drop: e => handleDrop(e, state.currentPath, os, system, onRefresh) }; }
function compareItems(a, b) { return (isFolder(a) ? -1 : 1) - (isFolder(b) ? -1 : 1) || String(a.name).localeCompare(String(b.name)); }
function isFolder(item) { const name = item.name || ''; return item.type === 'directory' || item.type === 'folder' || item.isDirectory || name.endsWith('.folder'); }
function nodeToItem(node) { return { ...node, type: node.type === 'folder' ? 'directory' : node.type, name: node.name || String(node.path).split('/').pop() }; }
function visible(item) { return item.name && !item.name.startsWith('.'); }
function extensionOf(name = '') { const part = String(name).toLowerCase().split('.').pop(); return part && part !== String(name).toLowerCase() ? part.replace(/[^a-z0-9-]/g, '') : ''; }
function vfsPath(path = '/') { return String(path).startsWith('awtsmoos://') ? path : `/${String(path || '/').replace(/^\/+/, '')}`; }
function joinVfsPath(path = '/', name = '') { if (String(path).startsWith('awtsmoos://')) return `${path.replace(/\/+$/, '')}/${name}`; return `/${[path, name].join('/').split('/').filter(Boolean).join('/')}`; }
function cssEscape(value) { return String(value).split('\\').join('\\\\').split('"').join('\\"'); }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }
/** B"H: file view rows now expose kind, extension, locality, permission, and sync as visible hooks. */
