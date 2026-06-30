// B"H
import { showContextMenu } from '/os/contextMenuManager.js';
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDrop.js';
import { showExplorerItemMenu } from './itemContextMenu.js';
export function fileItemEvents({ item, body, state, os, system, controller, onRefresh, onEnterSelectionMode, onExitSelectionMode, draw }) {
  return { dragstart:e => handleDragStart(e, item.path, e.currentTarget.classList.contains('selected'), body), dragover:item.kind === 'folder' ? handleDragOver : null, dragleave:item.kind === 'folder' ? handleDragLeave : null, drop:item.kind === 'folder' ? e => handleDrop(e, item.path, os, system, onRefresh) : null, click:e => click(e), dblclick:e => open(e), contextmenu:e => context(e), keydown:e => key(e) };
  async function click(event) { event.stopPropagation(); if (event.detail > 1) return; if (state.selectionMode || event.ctrlKey || event.metaKey || event.shiftKey) return toggle(); controller.clearSelection(); controller.select(item.path); draw(); }
  async function open(event) { event?.preventDefault?.(); event?.stopPropagation?.(); await controller.open(item); if (item.kind === 'folder') onRefresh?.(); }
  function key(event) { if (event.key === 'Enter') return open(event); if (event.key === ' ') { event.preventDefault(); toggle(); } }
  function toggle() { controller.toggleSelection(item.path); draw(); if (!controller.selection().count) onExitSelectionMode?.(); }
  function context(event) { controller.clearSelection(); controller.select(item.path); draw(); if (controller.isRemote()) return showExplorerItemMenu({ event, item, controller }); showContextMenu({ os, event, path:state.currentPath, title:item.name, isFolder:item.kind === 'folder', onRefresh, onOpen:() => controller.open(item), onEnterSelectionMode:() => onEnterSelectionMode(item.path) }); }
}
/** B"H: Events are shared so icons and rows answer the same knock. */
