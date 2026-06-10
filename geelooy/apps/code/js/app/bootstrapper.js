// B"H
/**
 * @file bootstrapper.js
 * @brief Restores persistent Code app settings into State.
 *
 * Chapter 19: At ignition the Awtsmoos reads the old world and recreates its
 * laws: preview engine, relay, tunnels, SSH keys, tabs, and sync links.
 */

import { State } from '../state.js';
import { ModelManager } from '../vibe/model-manager.js';

export class Bootstrapper {
  static ignite() {
    ModelManager.init();
    import('../tunnel/browser-agent.js').then(m => m.BrowserTunnelAgent.init());
    import('../sync/folder-sync.js').then(m => m.FolderSync.init());
    import('../session/account-panel.js').then(m => m.AwtsmoosAccountPanel.init());
    const settings = readSettings();
    State.githubToken = settings.githubToken || null;
    State.useTabs = settings.useTabs ?? true;
    State.previewEngine = settings.previewEngine || 'merkava';
    State.relayUrl = settings.relayUrl || '';
    State.sshProfiles = Array.isArray(settings.sshProfiles) ? settings.sshProfiles : [];
    State.browserTunnel = settings.browserTunnel || {};
    State.folderSyncLinks = Array.isArray(settings.folderSyncLinks) ? settings.folderSyncLinks : [];
    console.log('B"H: Primitive constants established.');
  }
}

function readSettings() {
  try {
    return JSON.parse(localStorage.getItem('vividX_settings_profound') || '{}');
  } catch (_error) {
    return {};
  }
}
