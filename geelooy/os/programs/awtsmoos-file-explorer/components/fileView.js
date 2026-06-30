// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { showContextMenu } from '/os/contextMenuManager.js';
import { handleDragStart, handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDrop.js';
import { classForMount } from '../utils/mountClass.js';
import createFileItem from './fileItem.js';
import { emptyState, errorState } from './emptyState.js';
import { showExplorerItemMenu } from './itemContextMenu.js';

export default function createFileView({ state, os, controller, onRefresh, system, onEnterSelectionMode, onExitSelectionMode }) {
  const body = createElement({ tag:'div', attributes:{ class:'file-explorer-body', 'data-state':'idle' }, on:dropEvents(state, os, system, onRefresh) });
  async function render() { try { body.dataset.state = 'loading'; await controller.refresh(); draw(); } catch (error) { drawError(error); } }
  function draw() { body.replaceChildren(); body.className = `file-explorer-body ${state.viewMode}-view ${classForMount(controller.getCurrentMount())}`; body.dataset.state = state.loading ? 'loading' : 'ready'; const items = controller.getRenderItems(); items.length ? items.forEach(item => body.appendChild(itemNode(item))) : body.appendChild(emptyState({ className:classForMount(controller.getCurrentMount()), title:'Folder is empty', detail:`Intentional silence · ${controller.getCurrentMount().title || 'Local mount'}` })); }
  function drawError(error) { body.replaceChildren(errorState(error)); body.dataset.state = 'error'; }
  function itemNode(item) { return createFileItem({ item, selected:controller.selection().paths.includes(item.path), events:itemEvents(item) }); }
  function itemEvents(item) { return { dragstart:e => handleDragStart(e, item.path, e.currentTarget.classList.contains('selected'), body), dragover:item.kind === 'folder' ? handleDragOver : null, dragleave:item.kind === 'folder' ? handleDragLeave : null, drop:item.kind === 'folder' ? e => handleDrop(e, item.path, os, system, onRefresh) : null, click:e => clickItem(e, item), contextmenu:e => context(e, item), keydown:e => keyItem(e, item) }; }
  async function clickItem(event, item) { event.stopPropagation(); if (state.selectionMode) return toggleSelected(item); await controller.open(item); if (item.kind === 'folder') onRefresh?.(); }
  async function keyItem(event, item) { if (event.key !== 'Enter') return; event.preventDefault(); await clickItem(event, item); }
  function toggleSelected(item) { controller.toggleSelection(item.path); draw(); if (!controller.selection().count) onExitSelectionMode?.(); }
  function context(event, item) { controller.clearSelection(); controller.select(item.path); draw(); if (controller.isRemote()) return showExplorerItemMenu({ event, item, controller }); showContextMenu({ os, event, path:state.currentPath, title:item.name, isFolder:item.kind === 'folder', onRefresh, onOpen:() => controller.open(item), onEnterSelectionMode:() => onEnterSelectionMode(item.path) }); }
  return { dom:body, render, draw };
}
function dropEvents(state, os, system, onRefresh) { return { dragover:handleDragOver, dragleave:handleDragLeave, drop:e => handleDrop(e, state.currentPath, os, system, onRefresh) }; }

/** B"H: normal click opens again; remote context menus and keyboard entry are alive. */
