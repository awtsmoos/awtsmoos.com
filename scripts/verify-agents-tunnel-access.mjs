// B"H
/**
 * @file verify-agents-tunnel-access.mjs
 * @brief Verifies every shared Awtsmoos AI surface can see the tunnel ocean.
 *
 * Chapter 456: The auditor lit a lamp at every gate. It does not pretend that
 * every bridge is online; it proves every agent sees the same 452-name crown,
 * knows the local tunnel door, knows the OAuth/session door, and names the
 * Virtual OS fallback without smuggling secrets into the walls.
 */

import fs from 'fs';
import { ALL_TUNNEL_ACTIONS } from '../geelooy/ai/central/actionCatalog.js';
import { GENERATED_TUNNEL_ACTIONS } from '../geelooy/ai/central/generatedTunnelActions.js';
import {
  ALL_RUNTIME_ACTIONS,
  SAFE_ACTIONS,
  VIRTUAL_ACTIONS,
  actionCapability,
  buildToolManifest
} from '../geelooy/shared/awtsmoos-runtime/index.js';

const requiredActions = [
  'commandTreeRun',
  'awtsmoosCommandTree',
  'merkavaCommandTree',
  'chatgptLogin',
  'oauthDoctor',
  'aiAgentMessage',
  'aiWorkflowRun',
  'previewExposeLocalServer'
];

const fileChecks = [
  ['geelooy/apps/code/js/code-chat/oracle.js', ['ALL_TUNNEL_ACTIONS', 'getBrowserLocalTunnelBridge', 'executeAgentTool']],
  ['geelooy/shared/awtsmoos-runtime/agent-core.js', ['ALL_RUNTIME_ACTIONS', 'OAuth/session vessel', 'Virtual OS fallback']],
  ['geelooy/shared/awtsmoos-runtime/actions.js', ['GENERATED_TUNNEL_ACTIONS', 'ALL_RUNTIME_ACTIONS']],
  ['geelooy/shared/awtsmoos-runtime/index.js', ['ALL_RUNTIME_ACTIONS', 'buildToolManifest']],
  ['geelooy/ai/central/index.js', ['ALL_TUNNEL_ACTIONS', 'makeAwtsmoosToolSchema', 'makeBridgeToolSchemas']],
  ['geelooy/ai/central/toolSchemas.js', ['awtsmoos_tool_call', 'action']],
  ['geelooy/ai/central/browserLocalTunnelBridge.js', ['127.0.0.1:3977', 'localTunnelApiUrl']],
  ['geelooy/ai/agents/localToolBridge.mjs', ['LocalToolBridge', 'ALL_TUNNEL_ACTIONS', 'toolCallName', 'buildActions']],
  ['geelooy/ai/agents.md', ['native/local tunnel', 'OAuth/session', 'Virtual OS fallback']]
];

const failures = [];
function requireTrue(ok, label) {
  if (!ok) failures.push(label);
}
function read(path) {
  return fs.readFileSync(path, 'utf8');
}

requireTrue(ALL_TUNNEL_ACTIONS.length === GENERATED_TUNNEL_ACTIONS.length, 'central catalog must match generated actions');
requireTrue(ALL_RUNTIME_ACTIONS.length === ALL_TUNNEL_ACTIONS.length, 'shared runtime must expose full central catalog');
requireTrue(buildToolManifest().length === ALL_TUNNEL_ACTIONS.length, 'shared tool manifest must expose full catalog');
requireTrue(SAFE_ACTIONS.length > 0, 'safe action subset must remain available');
requireTrue(VIRTUAL_ACTIONS.length > 0, 'virtual action subset must remain available');

for (const action of requiredActions) {
  requireTrue(ALL_RUNTIME_ACTIONS.includes(action), `missing required action ${action}`);
}
requireTrue(actionCapability('commandTreeRun') === 'requires-live-tunnel', 'live-only commandTreeRun must stay gated');
requireTrue(actionCapability('read') === 'virtual-compatible', 'read must remain virtual-compatible');
requireTrue(actionCapability('command') === 'live-tunnel-preferred', 'command must prefer live tunnel');
requireTrue(actionCapability('totallyFakeAction') === 'unknown-action', 'unknown actions must be labeled unknown');

for (const [path, needles] of fileChecks) {
  const text = read(path);
  for (const needle of needles) {
    requireTrue(text.includes(needle), `${path} missing ${needle}`);
  }
}

const report = {
  ok: failures.length === 0,
  actionCount: ALL_TUNNEL_ACTIONS.length,
  sharedCount: ALL_RUNTIME_ACTIONS.length,
  toolCount: buildToolManifest().length,
  safeCount: SAFE_ACTIONS.length,
  virtualCount: VIRTUAL_ACTIONS.length,
  checkedFiles: fileChecks.length,
  requiredActions,
  failures
};
console.log(JSON.stringify(report, null, 2));
if (failures.length) process.exit(1);
