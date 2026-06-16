// B"H
/**
 * Chapter 478: The public command names were tested at the command vessel gate.
 * The manifest promised commandStart/status/output/cancel; this stress proves
 * the top-level command router maps those names before a restarted agent serves
 * them live.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { ACTIONS, handleCommand } = require('../geelooy/apps/tunnel/agent/tools/command/index.js');

for (const name of ['command', 'commandRun', 'runCommand', 'commandStart', 'commandStatus', 'commandJobOutputPage', 'commandOutputPage', 'commandCancel']) {
  assert.equal(typeof ACTIONS[name], 'function', `${name} missing from top-level command router`);
}
const missing = await handleCommand({ action: 'noSuchCommandAction' });
assert.equal(missing.ok, false);
assert.equal(missing.error, 'unknown_command_action');
assert.ok(missing.availableActions.includes('commandStart'));
assert.ok(missing.availableActions.includes('commandOutputPage'));
console.log(JSON.stringify({ ok: true, checks: ['router-action-map', 'unknown-action-guidance'], actionCount: Object.keys(ACTIONS).length }, null, 2));
