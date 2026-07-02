// B"H
import { createState } from './state.js';
import { createSystemBridge } from './systemBridge.js';
import { createExplorerController } from './api/controller.js';
import { registerExplorerActions } from './api/actions/registry.js';
import createShell from './components/shell.js';
import { ensureStyles } from './styles/index.js';

export const HOME_PATH = '/desktop.folder';

/** B"H: Explorer opens in the user's stored files, not the root machinery. */
export default ({ os, path, system } = {}) => {
  ensureStyles();
  const state = createState(path || HOME_PATH);
  const bridge = createSystemBridge(system || os);
  const controller = createExplorerController({ os, state, system: bridge });
  const shell = createShell({ state, os, controller, system: bridge, onNavigate:navigateTo, onRefresh:refresh });
  registerExplorerActions(controller, { state, os, system: bridge, controller, afterAction:refresh });
  navigateTo(state.currentPath, { history:false });
  return { div:shell.dom, refresh, controller };

  async function navigateTo(nextPath = HOME_PATH, options = {}) {
    try { await controller.navigate(nextPath || HOME_PATH, options); shell.updatePath?.(); await refresh(); }
    catch (error) { bridge.makeToast?.(error.message || String(error), 'error', 'explorer'); }
  }

  async function refresh() { shell.update?.(); await shell.renderFiles?.(); }
};
