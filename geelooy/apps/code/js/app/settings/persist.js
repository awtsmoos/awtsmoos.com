// B"H
/**
 * @file persist.js
 * @brief Reads settings form values into State and localStorage.
 *
 * Chapter 19: The Awtsmoos seals the user's choices without duplicating the
 * scroll. Preview engine, relay, tunnel, SSH, and tabs become one saved memory.
 */

import { State } from '../../state.js';
import { collectSshProfiles } from './ssh.js';

export function collectSettings(container) {
  State.githubToken = container.querySelector('#github-token-input')?.value || null;
  State.relayUrl = container.querySelector('#relay-url-input')?.value.trim() || '';
  State.useTabs = Boolean(container.querySelector('#use-tabs-checkbox')?.checked);
  State.previewEngine = container.querySelector('#preview-engine-select')?.value || 'merkava';
  State.sshProfiles = collectSshProfiles(container);
  State.browserTunnel = {
    ...(State.browserTunnel || {}),
    autoStart: Boolean(container.querySelector('#browser-tunnel-enabled')?.checked),
    enabled: Boolean(container.querySelector('#browser-tunnel-enabled')?.checked),
    tunnelName: container.querySelector('#browser-tunnel-name')?.value.trim() || State.browserTunnel?.tunnelName || '',
    relayUrl: container.querySelector('#browser-tunnel-relay')?.value.trim() || ''
  };
  return snapshot();
}

export function saveSettings(container) {
  const settings = collectSettings(container);
  localStorage.setItem('vividX_settings_profound', JSON.stringify(settings));
  return settings;
}

export function snapshot() {
  return {
    githubToken: State.githubToken,
    relayUrl: State.relayUrl,
    sshProfiles: State.sshProfiles,
    browserTunnel: State.browserTunnel,
    folderSyncLinks: State.folderSyncLinks || [],
    previewEngine: State.previewEngine || 'merkava',
    useTabs: State.useTabs
  };
}
