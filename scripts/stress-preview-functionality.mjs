// B"H
/**
 * Chapter 480: Preview links became doors, not instructions to build doors.
 * This stress proves preview payloads for pages, collections, proxies, files,
 * folders, and action results auto-create real awtsmoos.com/view artifacts.
 */
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { buildPreviewActions } = require('../geelooy/apps/tunnel/agent/tools/fs/actionGroups/previewActions.js');
const { autoCreatePreviewResult, isPreviewAction } = require('../geelooy/api/tunnel/control/preview/previewAutoCreate.js');
const { findPreviewAny } = require('../geelooy/api/tunnel/control/preview/previewStore.js');
const { renderPreview } = require('../geelooy/api/tunnel/control/preview/previewRenderer.js');

const ident = { userId: `preview-stress-${Date.now()}` };
function action(name, payload) { return buildPreviewActions({ payload: { action: name, tunnelName: 'awt-test', ...payload } })[name](); }
function created(name, result) {
  const got = autoCreatePreviewResult(ident, { action: name }, result);
  assert.ok(got.viewUrl, `${name}: viewUrl`);
  assert.match(got.viewUrl, /^https:\/\/awtsmoos\.com\/view\/view_/);
  assert.ok(findPreviewAny(got.previewId), `${name}: stored`);
  const rendered = renderPreview(got.createdPreview);
  assert.equal(rendered.statusCode, 200, `${name}: render`);
  return got;
}

assert.equal(isPreviewAction('previewPage'), true);
assert.equal(isPreviewAction('read'), false);
created('previewPage', await action('previewPage', { content: '<h1>B"H page</h1>' }));
created('previewCollection', await action('previewCollection', { files: [{ title: 'One', path: 'a.js' }] }));
created('previewExposeLocalServer', await action('previewExposeLocalServer', { port: 32123, proxyPath: '/' }));
created('previewFile', await action('previewFile', { p: 'package.json' }));
created('previewFolder', await action('previewFolder', { p: 'geelooy' }));
created('previewActionResult', await action('previewActionResult', { actionId: 'act_test_preview' }));
const untouched = autoCreatePreviewResult(ident, { action: 'read' }, { ok: true, preview: { kind: 'page' } });
assert.deepEqual(untouched, { ok: true, preview: { kind: 'page' } });
console.log(JSON.stringify({ ok: true, checks: ['page', 'collection', 'proxy', 'file', 'folder', 'action-result', 'render', 'non-preview-untouched'] }, null, 2));
