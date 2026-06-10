// B"H
/**
 * @file settings.js
 * @brief Small orchestrator for the Code app settings dialog.
 *
 * Chapter 19: The enormous settings scroll split into vessels. The Awtsmoos
 * keeps this file as a conductor only: markup, bindings, persistence, and
 * tunnel side effects each remain clean enough to breathe.
 */

import { UI } from '../ui.js';
import { ModelManager } from '../vibe/model-manager.js';
import { settingsHtml } from './settings/markup.js';
import { profileHtml, blankProfile, bindSshProfileEvents } from './settings/ssh.js';
import { saveSettings } from './settings/persist.js';

export const SettingsManager = {
  async show() {
    const dialogPromise = UI.showDialog({
      title: 'System Settings',
      contentHTML: settingsHtml(),
      okText: 'Save & Close',
      cancelText: 'Cancel'
    });
    const dialogEl = document.getElementById('generic-dialog');
    if (dialogEl) this.bindEvents(dialogEl);
    const result = await dialogPromise;
    if (!result) return;
    this.save(dialogEl);
    UI.showToast('Settings manifested.', 'success');
  },

  getHTML() {
    return settingsHtml();
  },

  bindEvents(container) {
    bindRelayDownload(container);
    bindSsh(container);
    bindModelSettings(container, () => this.bindEvents(container));
  },

  save(container = document) {
    const settings = saveSettings(container);
    import('../tunnel/browser-agent.js').then(module => {
      if (settings.browserTunnel?.autoStart) module.BrowserTunnelAgent.start();
      else module.BrowserTunnelAgent.stop();
    });
    return settings;
  }
};

function bindRelayDownload(container) {
  const relayDlBtn = container.querySelector('#settings-dl-relay-btn');
  if (!relayDlBtn) return;
  relayDlBtn.onclick = async event => {
    event.preventDefault();
    try {
      const { RelayServerCode } = await import('../features/relay-server-code.js');
      const blob = new Blob([RelayServerCode], { type: 'application/javascript' });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = 'relay-server.js';
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      UI.showToast('Downloaded relay-server.js. Run with: node relay-server.js', 'success', 5000);
    } catch (error) {
      UI.showToast('Failed to download relay script: ' + error.message, 'error');
    }
  };
}

function bindSsh(container) {
  const sshWrap = container.querySelector('#ssh-profiles-settings');
  const addSsh = container.querySelector('#settings-add-ssh-profile');
  if (addSsh && sshWrap) {
    addSsh.onclick = event => {
      event.preventDefault();
      sshWrap.insertAdjacentHTML('beforeend', profileHtml(blankProfile()));
      bindSshProfileEvents(container);
    };
  }
  bindSshProfileEvents(container);
}

function bindModelSettings(container, rebind) {
  ModelManager.bindSettingsEvents(container, () => {
    const panel = container.querySelector('.vibe-settings-panel');
    if (panel) panel.outerHTML = ModelManager.getSettingsPanelHTML();
    rebind();
  });
}
