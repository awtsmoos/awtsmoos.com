// B"H
import { createElement } from "/scripts/awtsmoos/ui/basic.js";
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from "../utils/dragDrop.js";
import { showContextMenu } from '/os/contextMenuManager.js';
import { getJsIcon, getCssIcon, getHtmlIcon, getFileIcon, getFolderIcon } from "../utils/icons.js";
import * as RemoteFs from "/os/remote/remoteFs.js";
export default function createFileView({ state, os, onNavigate, onRefresh, system, onEnterSelectionMode, onExitSelectionMode }) {
  const body = createElement({ tag:"div", attributes:{ class:"file-explorer-body" }, on:{ dragover:handleDragOver, dragleave:handleDragLeave, drop:e => handleDrop(e, state.currentPath, os, system, onRefresh) }});
  const iconSvg = (name, folder) => folder || name.endsWith('.folder') || name === 'desktop.folder' ? getFolderIcon() : name.endsWith('.js') ? getJsIcon() : name.endsWith('.css') ? getCssIcon() : name.endsWith('.html') ? getHtmlIcon() : getFileIcon();
  async function itemsForPath() { if (state.remoteMode) return await RemoteFs.list(os, state.currentPath); if (state.currentPath === '/') return (await os.db.getAllStoreNames()).map(i => typeof i === 'string' ? { name:i, type:'directory' } : i).filter(i => i.name && !i.name.startsWith('.')); return await os.db.getAllKeys(state.currentPath); }
  async function performOpen(path, item, isFolder, meta = {}) {
    if (state.remoteMode) return remoteOpen(meta, path, item, isFolder);
    if (isFolder) return onNavigate(path === '/' ? item : `${path}/${item}`);
    os.addWindow({ title:item, content:await os.db.Laynin(path, item), path, os });
  }
  async function remoteOpen(meta, path, item, isFolder) {
    if (meta.action === 'openPreview' && meta.url) return window.open(meta.url, '_blank', 'noopener');
    if (meta.path) return onNavigate(meta.path);
    const full = path.endsWith('/') ? path + item : `${path}/${item}`;
    if (isFolder) return onNavigate(full);
    const got = await RemoteFs.read(full);
    os.addWindow({ title:item, content:got.content || got.body || got.error || JSON.stringify(got, null, 2), path:full, os });
  }
  async function render() { body.innerHTML = ''; body.className = `file-explorer-body ${state.viewMode}-view`; try { const items = await itemsForPath(); drawItems(items); } catch (error) { body.innerHTML = `<div class="remote-folder-state">${escapeHtml(error.message)}</div>`; } }
  function drawItems(items) { items.sort((a,b) => (a.type === 'directory' ? -1 : 1) - (b.type === 'directory' ? -1 : 1) || String(a.name).localeCompare(String(b.name))); if (!items.length) body.innerHTML = '<div class="empty-folder-state">Folder is empty</div>'; else items.forEach(renderItem); }
  function renderItem(item) { const name = item.name, isFolder = item.type === 'directory' || item.isDirectory || name.endsWith('.folder'), full = item.path || (state.currentPath === '/' ? name : `${state.currentPath}/${name}`); const el = createElement({ tag:'div', attributes:{ class:`file-item icon ${state.remoteMode ? 'remote-file-item' : ''}`, draggable:String(!state.remoteMode), 'data-path':full }, children:[{ tag:'div', attributes:{ class:'icon-img' }, html:iconSvg(name, isFolder) }, { tag:'span', html:name }], on:{ dragstart:e => handleDragStart(e, full, el.classList.contains('selected'), body), dragover:isFolder ? handleDragOver : null, dragleave:isFolder ? handleDragLeave : null, drop:isFolder ? e => handleDrop(e, full, os, system, onRefresh) : null, click:e => { e.stopPropagation(); state.selectionMode ? select(el) : performOpen(state.currentPath, name, isFolder, item); }, contextmenu:e => context(e, el, name, isFolder, full) }}); body.appendChild(el); }
  function select(el) { el.classList.toggle('selected'); if (!body.querySelectorAll('.selected').length) onExitSelectionMode(); }
  function context(event, el, title, isFolder, full) { if (state.remoteMode) return; if (!state.selectionMode) { body.querySelectorAll('.selected').forEach(x => x.classList.remove('selected')); el.classList.add('selected'); } showContextMenu({ os, event, path:state.currentPath, title, isFolder, onRefresh, onOpen:() => performOpen(state.currentPath, title, isFolder), onEnterSelectionMode:() => onEnterSelectionMode(full) }); }
  return { dom:body, render };
}
function escapeHtml(value) { return String(value || '').replace(/[&<>]/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;' }[c])); }
/** B"H: remote drive entries now open tunnels and previews as files, not symbols. */
