// B"H
/**
 * @file markup.js
 * @brief Settings HTML split into smaller, living vessels.
 *
 * Chapter 19: The Awtsmoos made the settings scroll readable. Preview laws,
 * relay gates, tunnel breath, SSH profiles, and editor behavior each receive
 * a clean chamber instead of one enormous tangled parchment.
 */

import { State } from '../../state.js';
import { ModelManager } from '../../vibe/model-manager.js';
import { profilesHtml } from './ssh.js';

export function settingsHtml() {
  return `<div class="code-settings-shell">
    ${generalHtml()}
    ${relayHtml()}
    ${previewHtml()}
    ${tunnelHtml()}
    ${sshHtml()}
    ${editorHtml()}
    <hr>
    ${ModelManager.getSettingsPanelHTML()}
  </div>`;
}

function generalHtml() {
  return `<section class="settings-card"><h4>General</h4>
    <label>GitHub Personal Access Token</label>
    <input type="password" id="github-token-input" value="${esc(State.githubToken || '')}" placeholder="ghp_...">
  </section>`;
}

function relayHtml() {
  return `<section class="settings-card"><div class="settings-title-row">
      <h4>Relay Server Connection</h4>
      <button id="settings-dl-relay-btn" class="primary-btn" type="button">Download Script</button>
    </div>
    <input type="text" id="relay-url-input" value="${esc(State.relayUrl || '')}" placeholder="http://localhost:3000">
    <details><summary>API and CORS requirements</summary>
      <pre>Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: POST, OPTIONS
action=list/read/write/mkdir/delete/download-md</pre>
    </details>
  </section>`;
}

function previewHtml() {
  const engine = State.previewEngine || 'merkava';
  return `<section class="settings-card"><h4>HTML Preview Engine</h4>
    <p class="settings-help">Choose whether previews render through the Merkava synthetic runtime + WebGL virtual DOM, a real sandbox iframe, or both.</p>
    <select id="preview-engine-select">
      <option value="merkava" ${engine === 'merkava' ? 'selected' : ''}>Merkava synthetic DOM only</option>
      <option value="iframe" ${engine === 'iframe' ? 'selected' : ''}>Sandbox iframe only</option>
      <option value="both" ${engine === 'both' ? 'selected' : ''}>Both: iframe + Merkava diagnostics</option>
    </select>
  </section>`;
}

function tunnelHtml() {
  const tunnel = State.browserTunnel || {};
  return `<section class="settings-card"><h4>Browser Tunnel Agent</h4>
    <label class="settings-check"><input type="checkbox" id="browser-tunnel-enabled" ${tunnel.autoStart ? 'checked' : ''}> Enable browser tunnel</label>
    <input type="text" id="browser-tunnel-name" value="${esc(tunnel.tunnelName || '')}" placeholder="awt-editor-4200">
    <input type="text" id="browser-tunnel-relay" value="${esc(tunnel.relayUrl || '')}" placeholder="wss://awtsmoos.com">
  </section>`;
}

function sshHtml() {
  return `<section class="settings-card"><div class="settings-title-row">
      <h4>SSH Workspaces & Keys</h4>
      <button id="settings-add-ssh-profile" class="secondary-btn" type="button">Add SSH Profile</button>
    </div>
    <div id="ssh-profiles-settings">${profilesHtml(State.sshProfiles || [])}</div>
  </section>`;
}

function editorHtml() {
  return `<section class="settings-card"><h4>Editor</h4>
    <label class="settings-check"><input type="checkbox" id="use-tabs-checkbox" ${State.useTabs ? 'checked' : ''}> Use tab characters for indentation</label>
  </section>`;
}

function esc(value = '') {
  return String(value).replace(/[&<>"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch]));
}
