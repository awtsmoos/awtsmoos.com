// B"H
/**
 * @file stress-tunnel-control-actions.mjs
 * @brief Source-level stress checks for tunnel-control response/action safety.
 *
 * Chapter 458: The river was tested after the cup was already full. These
 * checks prove the JSON/HTML/text responders do not throw after a streaming or
 * proxy route has already committed headers, and that the action catalogs and
 * command aliases stay coherent before live tunnel smoke tests are run.
 */

import assert from 'assert/strict';
import { createRequire } from 'module';
import { ALL_TUNNEL_ACTIONS } from '../geelooy/ai/central/actionCatalog.js';
import { ALL_RUNTIME_ACTIONS, buildToolManifest } from '../geelooy/shared/awtsmoos-runtime/index.js';

const require = createRequire(import.meta.url);
const respond = require('../geelooy/api/tunnel/control/core/respond.js');
const { buildFsPayload } = require('../geelooy/api/tunnel/control/core/tunnelPayload.js');

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

stressRespondHelpers();
stressCatalogs();
stressCommandAliases();
console.log(JSON.stringify({ ok: true, checks: ['respond-headers-sent', 'catalogs', 'command-aliases'], actionCount: ALL_RUNTIME_ACTIONS.length }, null, 2));
