// B"H
import { createState } from './state.js';
import { createSystemBridge } from './systemBridge.js';
import { createExplorerController } from './api/controller.js';
import { registerExplorerActions } from './api/actions/registry.js';
import createShell from './components/shell.js';
import { ensureStyles } from './styles/index.js';

const START_PATH = '/';

/**
 * B"H
 * Explorer Home is the user's virtual filesystem home. Remote tunnels appear
 * there as living drives, but they do not steal the throne of home.
 */
export default ({ os, path, system } = {}) => {
  ensureStyles();
  const state = createState(path || START_PATH);
  const bridge = createSystemBridge(system || os);
  const controller = createExplorerController({ os, state, system: bridge });
  const shell = createShell({ state, os, controller, system: bridge, onNavigate:navigateTo, onRefresh:refresh });
  registerExplorerActions(controller, { state, os, system: bridge, controller, afterAction:refresh });
  navigateTo(state.currentPath);
  return { div:shell.dom, refresh, controller };

  async function navigateTo(nextPath, options = {}) {
    try { await controller.navigate(nextPath, options); shell.updatePath?.(); await refresh(); }
    catch (error) { bridge.makeToast?.(error.message || String(error), 'error', 'explorer'); }
  }

  async function refresh() { shell.update?.(); await shell.renderFiles?.(); }
};
