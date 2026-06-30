// B"H
import { createElement } from '/scripts/awtsmoos/ui/basic.js';
import { handleDragOver, handleDragLeave, handleDrop } from '../utils/dragDrop.js';
import { classForMount } from '../utils/mountClass.js';
import createFileItem from './fileItem.js';
import detailsHeader from './detailsHeader.js';
import { emptyState, errorState } from './emptyState.js';
import { fileItemEvents } from './fileItemEvents.js';
export default function createFileView({ state, os, controller, onRefresh, system, onEnterSelectionMode, onExitSelectionMode }) {
  const body = createElement({ tag:'div', attributes:{ class:'file-explorer-body', 'data-state':'idle' }, on:dropEvents(state, os, system, onRefresh) });
  async function render() { try { body.dataset.state = 'loading'; await controller.refresh(); draw(); } catch (error) { drawError(error); } }
  function draw() { body.replaceChildren(); body.className = `file-explorer-body ${state.viewMode}-view ${classForMount(controller.getCurrentMount())}`; body.dataset.state = state.loading ? 'loading' : 'ready'; const items = controller.getRenderItems(); if (state.viewMode === 'details') body.appendChild(detailsHeader()); items.length ? items.forEach(item => body.appendChild(itemNode(item))) : body.appendChild(emptyState({ className:classForMount(controller.getCurrentMount()), title:'Folder is empty', detail:`Intentional silence · ${controller.getCurrentMount().title || 'Local mount'}` })); }
  function drawError(error) { body.replaceChildren(errorState(error)); body.dataset.state = 'error'; }
  function itemNode(item) { return createFileItem({ item, viewMode:state.viewMode, selected:controller.selection().paths.includes(item.path), events:fileItemEvents({ item, body, state, os, system, controller, onRefresh, onEnterSelectionMode, onExitSelectionMode, draw }) }); }
  return { dom:body, render, draw };
}
function dropEvents(state, os, system, onRefresh) { return { dragover:handleDragOver, dragleave:handleDragLeave, drop:e => handleDrop(e, state.currentPath, os, system, onRefresh) }; }
/** B"H: fileView orchestrates; rows, icons, events, and headers each carry their part. */
