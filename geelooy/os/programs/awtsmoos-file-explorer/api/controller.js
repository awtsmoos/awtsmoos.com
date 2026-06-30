// B"H
import { createExplorerCommands } from './commands.js';
import { createExplorerEvents } from './events.js';
import { applyNavigationState } from './navigation.js';
import { isRemotePath, joinExplorerPath, normalizeExplorerPath } from './path.js';
import { normalizeRenderItems } from './renderModel.js';
import { createExplorerSelection } from './selection.js';

export function createExplorerController({ os, state, system } = {}) {
  const events = createExplorerEvents();
  const selection = createExplorerSelection({ emit:events.emit });
  const commands = createExplorerCommands();
  let items = [];
  async function refresh() {
    try {
      state.loading = true; state.error = '';
      const raw = await os.vfs.list(state.currentPath);
      items = normalizeRenderItems(raw, { currentPath:state.currentPath, os });
      state.items = items; state.loading = false;
      return events.emit('explorer.refresh', { path:state.currentPath, items });
    } catch (error) {
      state.loading = false; state.error = error.message;
      events.emit('explorer.error', { path:state.currentPath, error });
      throw error;
    }
  }
  async function navigate(path = '/') {
    const currentPath = applyNavigationState(state, path);
    events.emit('explorer.navigate', { path:currentPath, remote:isRemotePath(currentPath) });
    return await refresh();
  }
  async function open(item) {
    if (!item) return null;
    if (item.kind === 'folder') return await navigate(item.path);
    if (item.raw?.action === 'openPreview' && item.raw.url) return openPreview(item);
    const got = await os.vfs.read(item.path);
    os.addWindow({ title:item.name, content:contentOf(got), path:item.path, os });
    return events.emit('explorer.open', { item, result:got });
  }
  function setViewMode(mode) {
    state.viewMode = mode === 'details' ? 'details' : 'icons';
    events.emit('explorer.view.change', { mode:state.viewMode });
  }
  function getMounts() { return os?.vfs?.mounts?.() || []; }
  function getCurrentMount() { return os?.vfs?.resolve?.(state.currentPath)?.mount || {}; }
  return { navigate, refresh, open, setViewMode, getRenderItems:() => items, getMounts, getCurrentMount, isRemote:() => isRemotePath(state.currentPath), joinPath:joinExplorerPath, select:selection.select, toggleSelection:selection.toggle, clearSelection:selection.clear, selectAll:selection.selectAll, selection:selection.snapshot, on:events.on, emit:events.emit, command:commands, state, os, system };
}

function openPreview(item) {
  window.open(item.raw.url, '_blank', 'noopener');
  return item;
}

function contentOf(got = {}) {
  return got.content ?? got.body ?? got.error ?? JSON.stringify(got, null, 2);
}

export { normalizeExplorerPath };

/** B"H: the controller is the OS hand; components are only fingers of light. */
