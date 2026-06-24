// B"H
import fs from 'node:fs/promises';

const bridge = 'geelooy/os/socialInboxBridge.js';
const script = 'geelooy/os/script.js';
const checks = [];
function assert(condition, label, detail = {}) {
  if (!condition) { const error = new Error(label); error.detail = detail; throw error; }
  checks.push(label);
}

try {
  const bridgeText = await fs.readFile(bridge, 'utf8');
  const scriptText = await fs.readFile(script, 'utf8');
  assert(bridgeText.includes('initSocialInboxBridge'), 'bridgeExportsInit');
  assert(bridgeText.includes('window.AwtsmoosSocialInbox'), 'bridgeExposesGlobal');
  assert(bridgeText.includes('/api/social/communications/'), 'bridgeUsesCanonicalSocialApi');
  assert(scriptText.includes('./socialInboxBridge.js'), 'scriptImportsBridge');
  assert(scriptText.includes('initSocialInboxBridge({ os })'), 'scriptInitializesBridge');
  assert(!scriptText.includes('/api/v2/social'), 'v2NotRestoredInOs');
  console.log(JSON.stringify({ pass: true, checks }, null, 2));
} catch (error) {
  console.error(JSON.stringify({ pass: false, message: error.message, detail: error.detail || null }, null, 2));
  process.exit(1);
}
