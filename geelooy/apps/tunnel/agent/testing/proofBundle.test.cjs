'use strict';

/**
 * proofBundle.test.cjs — manifest schema + artifact SHA-256 binding for
 * agent/tools/chrome/proofBundle.js.
 *
 * Uses a temp dir as the bundle root so nothing touches the real repo.
 */

const test = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('crypto');
const fsp = require('fs').promises;
const os = require('os');
const path = require('path');

const {
  openBundle,
  bundleAddViewport,
  bundleSetTarget,
  bundleAddJson,
  bundleAddFile,
  closeBundle,
} = require('../tools/chrome/proofBundle.js');

const RUN_ID = 'test-run-1';
const COMMIT = 'deadbeef1234';
const ROUTE = 'https://example.test/route';

/** @returns {Promise<string>} Fresh temp dir to use as bundle root. */
async function tmpRoot() {
  return fsp.mkdtemp(path.join(os.tmpdir(), 'proofbundle-test-'));
}

function sha256Hex(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex');
}

test('openBundle creates .awtsmoos/verification/<runId>/ and returns a handle', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  assert.equal(bundle.runId, RUN_ID);
  assert.equal(bundle.commitSha, COMMIT);
  assert.equal(bundle.route, ROUTE);
  const stat = await fsp.stat(bundle.dir);
  assert.ok(stat.isDirectory());
  assert.ok(bundle.dir.endsWith(path.join('.awtsmoos', 'verification', RUN_ID)));
});

test('openBundle rejects missing identity fields', async () => {
  const root = await tmpRoot();
  await assert.rejects(() => openBundle({ runId: '', commitSha: COMMIT, route: ROUTE, root }), /proof_bundle_missing_identity/);
  await assert.rejects(() => openBundle({ runId: RUN_ID, commitSha: null, route: ROUTE, root }), /proof_bundle_missing_identity/);
  await assert.rejects(() => openBundle({ runId: RUN_ID, commitSha: COMMIT, route: '', root }), /proof_bundle_missing_identity/);
});

test('bundleAddJson returns {path, sha256} bound to the exact bytes written', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  const obj = { a: 1, nested: { b: [1, 2, 3] } };
  const res = await bundleAddJson(bundle, 'evidence.json', obj);
  assert.equal(res.path, 'evidence.json');
  const raw = await fsp.readFile(path.join(bundle.dir, 'evidence.json'));
  assert.equal(res.sha256, sha256Hex(raw));
  assert.deepEqual(JSON.parse(raw.toString('utf8')), obj);
});

test('bundleAddFile returns {path, sha256} bound to the exact bytes written', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  const bytes = crypto.randomBytes(2048);
  const res = await bundleAddFile(bundle, 'screenshot-390.png', bytes, 'image/png');
  assert.equal(res.path, 'screenshot-390.png');
  const raw = await fsp.readFile(path.join(bundle.dir, 'screenshot-390.png'));
  assert.equal(res.sha256, sha256Hex(bytes));
  assert.ok(raw.equals(bytes));
});

test('artifact names cannot escape the bundle directory', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  await assert.rejects(() => bundleAddJson(bundle, '../../escape.json', {}), /proof_bundle_bad_name/);
  await assert.rejects(() => bundleAddFile(bundle, '/absolute.png', Buffer.alloc(4)), /proof_bundle_bad_name/);
});

test('closeBundle writes manifest.json binding runId+commitSha+route+target+artifacts', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  bundleSetTarget(bundle, 'target-abc');
  bundleAddViewport(bundle, 390, 844);
  bundleAddViewport(bundle, 1280, 800);
  const j = await bundleAddJson(bundle, 'forensics-390.json', { overflow: [] });
  const f = await bundleAddFile(bundle, 'screenshot-390.png', Buffer.from([0x89, 0x50, 0x4e, 0x47]), 'image/png');

  const closed = await closeBundle(bundle, { verdict: 'pass' });
  assert.ok(closed.manifestPath.endsWith('manifest.json'));

  const manifest = JSON.parse(await fsp.readFile(closed.manifestPath, 'utf8'));
  assert.equal(manifest.runId, RUN_ID);
  assert.equal(manifest.commitSha, COMMIT);
  assert.equal(manifest.route, ROUTE);
  assert.equal(manifest.browserTargetId, 'target-abc');
  assert.equal(manifest.verdict, 'pass');
  assert.ok(manifest.timestamp);
  assert.deepEqual(manifest.viewports, [{ width: 390, height: 844 }, { width: 1280, height: 800 }]);
  assert.equal(manifest.artifacts.length, 2);
  const names = manifest.artifacts.map((a) => a.name).sort();
  assert.deepEqual(names, ['forensics-390.json', 'screenshot-390.png']);
  for (const a of manifest.artifacts) {
    assert.ok(/^[0-9a-f]{64}$/.test(a.sha256), 'artifact sha256 must be hex');
    assert.ok(a.mime);
  }
  const byName = Object.fromEntries(manifest.artifacts.map((a) => [a.name, a.sha256]));
  assert.equal(byName['forensics-390.json'], j.sha256);
  assert.equal(byName['screenshot-390.png'], f.sha256);
  // Manifest sha256 returned by closeBundle matches the file bytes.
  const raw = await fsp.readFile(closed.manifestPath);
  assert.equal(closed.sha256, sha256Hex(raw));
});

test('closeBundle writes visual-review.json and production-proof.json placeholders', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  await closeBundle(bundle, { verdict: 'fail' });
  const review = JSON.parse(await fsp.readFile(path.join(bundle.dir, 'visual-review.json'), 'utf8'));
  assert.equal(review.runId, RUN_ID);
  assert.equal(review.decision, 'unreviewed');
  const proof = JSON.parse(await fsp.readFile(path.join(bundle.dir, 'production-proof.json'), 'utf8'));
  assert.equal(proof.runId, RUN_ID);
  assert.equal(proof.commitSha, COMMIT);
  assert.equal(proof.verdict, 'fail');
  assert.ok(/^[0-9a-f]{64}$/.test(proof.manifestSha256));
});

test('closeBundle defaults to a failing verdict (fail closed)', async () => {
  const root = await tmpRoot();
  const bundle = await openBundle({ runId: RUN_ID, commitSha: COMMIT, route: ROUTE, root });
  const closed = await closeBundle(bundle, {});
  const manifest = JSON.parse(await fsp.readFile(closed.manifestPath, 'utf8'));
  assert.equal(manifest.verdict, 'fail');
});
