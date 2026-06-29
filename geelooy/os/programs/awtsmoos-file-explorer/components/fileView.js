// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDrop.js';
import { showContextMenu } from '/os/contextMenuManager.js';
import { getJsIcon, getCssIcon, getHtmlIcon, getFileIcon, getFolderIcon } from '../utils/icons.js';
import { classForMount, mountBadge } from '../utils/mountClass.js';
import * as RemoteFs from '/os/remote/remoteFs.js';
export default function createFileView({ state, os, onNavigate, onRefresh, system, onEnterSelectionMode, onExitSelectionMode }) {
  const body = createElement({ tag:'div', attributes:{ class:'file-explorer-body' }, on:{ dragover:handleDragOver, dragleave:handleDragLeave, drop:e => handleDrop(e, state.currentPath, os, system, onRefresh) }});
  const iconSvg = (name, folder) => folder || name.endsWith('.folder') || name === 'desktop.folder' ? getFolderIcon() : name.endsWith('.js') ? getJsIcon() : name.endsWith('.css') ? getCssIcon() : name.endsWith('.html') ? getHtmlIcon() : getFileIcon();
  async function itemsForPath() { if (state.remoteMode) return await RemoteFs.list(os, state.currentPath); const nodes = await os.vfs.list(vfsPath(state.currentPath)); return nodes.map(nodeToItem).filter(i => i.name && !i.name.startsWith('.')); }
  async function performOpen(path, item, isFolder, meta = {}) { if (state.remoteMode) return remoteOpen(meta, path, item, isFolder); const full = joinVfsPath(path, item); if (isFolder) return onNavigate(full); const got = await os.vfs.read(full); os.addWindow({ title:item, content:got.content, path, os }); }
  async function remoteOpen(meta, path, item, isFolder) { if (meta.action === 'openPreview' && meta.url) { os?.recordGraphEvent?.('file.preview', { path:meta.url }); return window.open(meta.url, '_blank', 'noopener'); } if (meta.path) return onNavigate(meta.path); const full = path.endsWith('/') ? path + item : `${path}/${item}`; if (isFolder) return onNavigate(full); const got = await RemoteFs.read(full); os.addWindow({ title:item, content:got.content || got.body || got.error || JSON.stringify(got, null, 2), path:full, os }); }
  async function render() { body.innerHTML = ''; body.className = `file-explorer-body ${state.viewMode}-view ${currentMountClass()}`; try { drawItems(await itemsForPath()); } catch (error) { body.innerHTML = `<div class="remote-folder-state">${escapeHtml(error.message)}</div>`; } }
  function drawItems(items) { items.sort((a,b) => (a.type === 'directory' ? -1 : 1) - (b.type === 'directory' ? -1 : 1) || String(a.name).localeCompare(String(b.name))); if (!items.length) body.innerHTML = `<div class="empty-folder-state ${currentMountClass()}">Folder is empty · ${escapeHtml(currentMountTitle())}</div>`; else items.forEach(renderItem); }
  function renderItem(item) { const name = item.name, isFolder = item.type === 'directory' || item.type === 'folder' || item.isDirectory || name.endsWith('.folder'); const full = item.path || joinVfsPath(state.currentPath, name); const mount = currentMount(full); const el = createElement({ tag:'div', attributes:{ class:`file-item icon ${state.remoteMode ? 'remote-file-item' : ''} ${classForMount(mount)}`, draggable:String(!state.remoteMode), 'data-path':full, title:mountBadge(mount, os?.vfs?.can?.(full, 'read') || {}) }, children:[{ tag:'div', attributes:{ class:'icon-img' }, html:iconSvg(name, isFolder) }, { tag:'span', html:name }, { tag:'small', attributes:{ class:'mount-badge' }, html:mount.adapterId || 'virtual' }], on:{ dragstart:e => handleDragStart(e, full, el.classList.contains('selected'), body), dragover:isFolder ? handleDragOver : null, dragleave:isFolder ? handleDragLeave : null, drop:isFolder ? e => handleDrop(e, full, os, system, onRefresh) : null, click:e => { e.stopPropagation(); state.selectionMode ? select(el) : performOpen(state.currentPath, name, isFolder, item); }, contextmenu:e => context(e, el, name, isFolder, full) }}); body.appendChild(el); }
  function currentMount(path = state.currentPath) { return os?.vfs?.resolve?.(vfsPath(path))?.mount || {}; }
  function currentMountClass() { return classForMount(currentMount()); }
  function currentMountTitle() { return currentMount().title || 'Local mount'; }
  function select(el) { el.classList.toggle('selected'); if (!body.querySelectorAll('.selected').length) onExitSelectionMode(); }
  function context(event, el, title, isFolder, full) { if (state.remoteMode) return; if (!state.selectionMode) { body.querySelectorAll('.selected').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); } showContextMenu({ os, event, path:state.currentPath, title, isFolder, onRefresh, onOpen:() => performOpen(state.currentPath, title, isFolder), onEnterSelectionMode:() => onEnterSelectionMode(full) }); }
  return { dom:body, render };
}
function nodeToItem(node) { return { ...node, type:node.type === 'folder' ? 'directory' : node.type, name:node.name || String(node.path).split('/').pop() }; }
function vfsPath(path = '/') { return String(path).startsWith('awtsmoos://') ? path : `/${String(path || '/').replace(/^\/+/, '')}`; }
function joinVfsPath(path = '/', name = '') { if (String(path).startsWith('awtsmoos://')) return `${path.replace(/\/+$/, '')}/${name}`; return `/${[path, name].join('/').split('/').filter(Boolean).join('/')}`; }
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: file view now reads through VFS and wears mount badges on each item. */
