// B"H
import { State } from '../state.js';
import { Actions } from '../actions/index.js';
import { Tabs } from '../tabs/index.js';
import { UI } from '../ui.js';
import { VisualEngine } from '../visuals/index.js';

/**
 * B"H
 * Chapter 812: The command palette became a portal map.
 * Any `open-url:/path` action opens the same Treasury doors as the OS Start
 * menu, keeping Apps/Code, Virtual OS, and Tunnel Control in one economy.
 */
export const PaletteExecutor = {
  execute(cmd, paletteObj) {
    paletteObj.hide();
    if (!cmd) return;
    if (typeof cmd.action === 'string' && cmd.action.startsWith('open-url:')) return openUrl(cmd.action.slice('open-url:'.length));
    if (cmd.action === 'reload-window') return location.reload();
    if (cmd.action === 'show-search') return import('../search-system.js').then(m => m.SearchSystem.show());
    if (cmd.action === 'scope-to-active') return scopeToActive();
    if (cmd.action === 'scope-clear') return import('../search-system.js').then(m => { m.SearchSystem.currentScopeItem = null; UI.showToast('Search scope cleared.', 'info'); });
    if (cmd.action === 'close-tab-direct') return State.activeTabId && Tabs.close(State.activeTabId);
    if (cmd.action === 'open-vibe-context') return openVibeContext();
    if (cmd.action === 'apply-external-ai-context') return openAIManifestation();
    if (cmd.action === 'show-graph-nav') return VisualEngine.triggerGraphNav();
    if (cmd.action === 'open-browser-tab') return import('../browser/index.js').then(m => m.BrowserManager.open());
    return Actions.handle(cmd.action);
  }
};

function openUrl(url) {
  if (!url || !url.startsWith('/')) return UI.showToast('Blocked unsafe portal URL.', 'error');
  window.open(url, '_blank', 'noopener,noreferrer');
  UI.showToast(`Opened ${url}`, 'success');
}

function activeTab() {
  return State.tabs.find(tab => tab.id === State.activeTabId);
}

function parentItem(tab) {
  const parentPath = tab.item.path.substring(0, tab.item.path.lastIndexOf('/')) || '/';
  return { ...tab.item, path: parentPath, kind: 'directory', name: parentPath.split('/').pop() || 'Root' };
}

function scopeToActive() {
  const tab = activeTab();
  if (!tab?.item) return UI.showToast('No active file to scope search.', 'warning');
  return import('../search-system.js').then(m => m.SearchSystem.show(parentItem(tab)));
}

function openVibeContext() {
  const tab = activeTab();
  if (!tab?.item) return UI.showToast('No active file to infer Vibe context.', 'warning');
  return import('../vibe/vibe-controller.js').then(m => m.VibeController.open(parentItem(tab)));
}

function openAIManifestation() {
  const tab = activeTab();
  if (!tab?.item) return UI.showToast('No active file to infer workspace context.', 'warning');
  return import('../features/ai-manifestation/index.js').then(m => {
    const item = parentItem(tab);
    item.workspaceId = tab.item.workspaceId;
    return m.AIManifestation.showDialog(item);
  });
}
