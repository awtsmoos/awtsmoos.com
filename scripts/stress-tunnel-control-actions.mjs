// B"H
/**
 * @file stress-tunnel-control-actions.mjs
 * @brief Source-level stress checks for tunnel-control response/action safety.
 *
 * Chapter 458: The river was tested after the cup was already full. These
 * checks prove the JSON/HTML/text responders do not throw after a streaming or
 * proxy route has already committed headers, and that the action catalogs and
 * command aliases stay coherent before live tunnel smoke tests are run.
 *
 * Chapter 461: The river now recognizes confused bundles. If an agent sends
 * action=bulk with actionsJson containing write steps, the gateway preserves the
 * actual intention as actionBatch. If it sends a real files list, bulk remains a
 * bulk read. The alias is mercy, not ambiguity.
 */

import assert from 'assert/strict';
import { createRequire } from 'module';
import { ALL_TUNNEL_ACTIONS } from '../geelooy/ai/central/actionCatalog.js';
import { ALL_RUNTIME_ACTIONS, buildToolManifest } from '../geelooy/shared/awtsmoos-runtime/index.js';

const require = createRequire(import.meta.url);
const respond = require('../geelooy/api/tunnel/control/core/respond.js');
const { buildFsPayload } = require('../geelooy/api/tunnel/control/core/tunnelPayload.js');
const { normalizeCarriers } = require('../geelooy/api/tunnel/control/routes/protectedFs.js');

function mockResponse(sent = false) {
  return {
    headersSent: sent,
    writableEnded: false,
    finished: false,
    statusCode: 200,
    headers: {},
    setHeader(name, value) {
      if (this.headersSent) throw new Error('ERR_HTTP_HEADERS_SENT');
      this.headers[name] = value;
    }
  };
}

function mockRequest(query = {}, body = {}) {
  return {
    $_GET: query,
    paramKinds: { GET: query, POST: body },
    request: { body }
  };
}

function stressRespondHelpers() {
  const fresh = { response: mockResponse(false) };
  assert.match(respond.json(fresh, { ok: true }), /"ok": true/);
  assert.equal(fresh.response.statusCode, 200);
  assert.equal(fresh.response.headers['Content-Type'], 'application/json; charset=utf-8');
  assert.match(respond.html({ response: mockResponse(false) }, '<b>BH</b>'), /BH/);
  assert.match(respond.text({ response: mockResponse(false) }, 'BH'), /BH/);

  const committed = { response: mockResponse(true) };
  assert.doesNotThrow(() => respond.json(committed, { ok: false }, 500));
  assert.doesNotThrow(() => respond.html(committed, '<i>late</i>', 500));
  assert.doesNotThrow(() => respond.text(committed, 'late', 'text/plain', 500));
  assert.equal(respond.json(committed, { ok: false }, 500), '');
  assert.equal(respond.html(committed, '<i>late</i>', 500), '');
  assert.equal(respond.text(committed, 'late', 'text/plain', 500), '');
}

function stressCatalogs() {
  const required = ['read', 'bulk', 'command', 'commandStart', 'commandStatus', 'commandCancel', 'commandTreeRun', 'simulateRuntime', 'previewExposeLocalServer'];
  assert.equal(ALL_TUNNEL_ACTIONS.length, ALL_RUNTIME_ACTIONS.length);
  assert.equal(buildToolManifest().length, ALL_TUNNEL_ACTIONS.length);
  for (const action of required) assert.ok(ALL_RUNTIME_ACTIONS.includes(action), `missing ${action}`);
}

function stressCommandAliases() {
  assert.equal(buildFsPayload(mockRequest({ command: 'echo one' })).command, 'echo one');
  assert.equal(buildFsPayload(mockRequest({ commands: 'echo two' })).command, 'echo two');
  const encoded = Buffer.from('echo three', 'utf8').toString('base64');
  assert.equal(buildFsPayload(mockRequest({ command64: encoded })).command, 'echo three');
  assert.equal(buildFsPayload(mockRequest({ commands64: encoded })).command, 'echo three');
}

function stressActionBundleAliases() {
  const writes = [
    { action: 'write', path: 'coby/apps/awtsmoos-light-catcher/src/state.js', content: 'export const state = {};\n' },
    { action: 'write', path: 'coby/apps/awtsmoos-light-catcher/src/input.js', content: 'export function input() {}\n' }
  ];
  const legacyBulk = normalizeCarriers({ action: 'bulk', actionsJson: JSON.stringify(writes), confirm: true }, mockRequest());
  assert.equal(legacyBulk.action, 'actionBatch');
  assert.equal(legacyBulk.compatibilityAlias, 'bulk_actionsJson_to_actionBatch');
  assert.equal(legacyBulk.steps.length, 2);
  assert.equal(legacyBulk.actions.length, 2);

  const directBatch = normalizeCarriers({ action: 'actionBatch', actionsJson: JSON.stringify(writes) }, mockRequest());
  assert.equal(directBatch.action, 'actionBatch');
  assert.equal(directBatch.steps.length, 2);

  const commandTree = normalizeCarriers({ action: 'commandTreeRun', actionsJson: JSON.stringify({ steps: writes, vars: { BH: true }, budgetPerutas: 7 }) }, mockRequest());
  assert.equal(commandTree.steps.length, 2);
  assert.equal(commandTree.vars.BH, true);
  assert.equal(commandTree.budgetPerutas, 7);

  const realBulk = normalizeCarriers({ action: 'bulk', files: ['a.js', 'b.js'], actionsJson: '' }, mockRequest());
  assert.equal(realBulk.action, 'bulk');
  assert.deepEqual(realBulk.files, ['a.js', 'b.js']);
}

stressRespondHelpers();
stressCatalogs();
stressCommandAliases();
stressActionBundleAliases();
console.log(JSON.stringify({
  ok: true,
  checks: ['respond-headers-sent', 'catalogs', 'command-aliases', 'actionsJson-bundle-aliases'],
  actionCount: ALL_RUNTIME_ACTIONS.length
}, null, 2));
