// B"H
import fs from 'node:fs/promises';

const files = {
  app: 'geelooy/apps/code/js/app/index.js',
  client: 'geelooy/apps/code/js/social/inbox-client.js',
  panel: 'geelooy/apps/code/js/social/inbox-panel.js'
};
const checks = [];
function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}

try {
  const app = await fs.readFile(files.app, 'utf8');
  const client = await fs.readFile(files.client, 'utf8');
  const panel = await fs.readFile(files.panel, 'utf8');
  assert(app.includes('../social/inbox-panel.js'), 'appImportsPanel');
  assert(app.includes('SocialInboxPanel.init()'), 'appInitializesPanel');
  assert(client.includes('/api/social/communications/'), 'clientUsesCanonicalSocialApi');
  assert(client.includes('window.AwtsmoosCodeSocialInbox'), 'clientExposesGlobal');
  assert(panel.includes('status-right'), 'panelUsesExistingStatusBar');
  assert(!app.includes('/api/v2/social') && !client.includes('/api/v2/social') && !panel.includes('/api/v2/social'), 'v2NotRestoredInCodeApp');
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
