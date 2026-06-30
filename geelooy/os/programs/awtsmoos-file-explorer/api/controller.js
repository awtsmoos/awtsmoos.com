// B"H
import { createExplorerCommands } from './commands.js';
import { createExplorerEvents } from './events.js';
import { applyNavigationState } from './navigation.js';
import { isRemotePath, joinExplorerPath, normalizeExplorerPath } from './path.js';
import { normalizeRenderItems } from './renderModel.js';
import { renderPipeline } from './renderPipeline.js';
import { createExplorerSelection } from './selection.js';
import { openExplorerItem, openInCode } from './openers.js';
import { pushHistory } from './actions/history.js';
import { registerExplorerActions } from './actions/registry.js';
export function createExplorerController({ os, state, system } = {}) {
  const events = createExplorerEvents(); const selection = createExplorerSelection({ emit:events.emit }); const commands = createExplorerCommands(); let items = [];
  async function refresh() { try { state.loading = true; state.error = ''; items = normalizeRenderItems(await os.vfs.list(state.currentPath), { currentPath:state.currentPath, os }); state.items = items; state.loading = false; return events.emit('explorer.refresh', { path:state.currentPath, items }); } catch (error) { state.loading = false; state.error = error.message; events.emit('explorer.error', { path:state.currentPath, error }); throw error; } }
  async function navigate(path = '/', options = {}) { const next = normalizeExplorerPath(path); if (options.history !== false) pushHistory(state, next); const currentPath = applyNavigationState(state, next); selection.clear(); events.emit('explorer.navigate', { path:currentPath, remote:isRemotePath(currentPath) }); return await refresh(); }
  async function open(item) { const result = await openExplorerItem({ os, state, navigate, item }); events.emit('explorer.open', { item, result }); return result; }
  function setViewMode(mode) { state.viewMode = ['details','icons','list','tiles'].includes(mode) ? mode : 'icons'; events.emit('explorer.view.change', { mode:state.viewMode }); }
  function getMounts() { return os?.vfs?.mounts?.() || []; }
  function getCurrentMount() { return os?.vfs?.resolve?.(state.currentPath)?.mount || {}; }
  function getRenderItems() { return renderPipeline(items, state); }
  const controller = { navigate, refresh, open, openInCode:item => openInCode({ os, item }), setViewMode, getRenderItems, getMounts, getCurrentMount, isRemote:() => isRemotePath(state.currentPath), joinPath:joinExplorerPath, select:selection.select, toggleSelection:selection.toggle, clearSelection:selection.clear, selectAll:selection.selectAll, selection:selection.snapshot, on:events.on, emit:events.emit, command:commands, state, os, system };
  commands.register('openRaw', ({ item }) => open(item)); commands.register('openInCodeRaw', ({ item }) => openInCode({ os, item })); registerExplorerActions(controller, { controller, os, state, system, afterAction:() => events.emit('explorer.action.after') });
  return controller;
}
export { normalizeExplorerPath };
/** B"H: controller now registers every Explorer action and filters rendered truth. */
