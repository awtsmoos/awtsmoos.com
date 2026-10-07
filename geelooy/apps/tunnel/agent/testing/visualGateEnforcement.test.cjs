'use strict';

/**
 * visualGateEnforcement.test.cjs — fixture-driven tests for the blocking
 * visual gate (agent/tools/fs/actionGroups/visualGateActions.js).
 *
 * No live browser is needed: every case feeds crafted evidence into
 * gate() (the pure verdict core) plus the forensics-missing path.
 *
 * The gate must BLOCK (ok:false, gateBlocked:true, verdict:'fail') on:
 *   (a) missing mobile viewport evidence (≤430px),
 *   (b) stale commitSha (evidence.commitSha !== expected),
 *   (c) HIGH hidden-content finding,
 *   (d) virtual-chrome marker (engine node-dom / virtualDom),
 *   (e) console exceptions,
 * and PASS on fresh, fully-passing fixture evidence.
 */

const test = require('node:test');
const assert = require('node:assert/strict');

const {
  evaluateGate,
  MOBILE_VIEWPORT_MAX,
} = require('../tools/fs/actionGroups/visualGateActions.js');

const URL = 'https://example.test/some-route';
const COMMIT = 'abc123def456';
const NOW = new Date().toISOString();
const LAST_CHANGE = new Date(Date.now() - 60 * 1000).toISOString(); // 1 min ago

// The sibling cssForensics.js module is built in parallel by another worker.
// Tests inject a stub so the pure gate core is exercised deterministically;
// the forensics-missing fail-closed path is covered by its own test below.
const FORENSICS_STUB = { scanConflicts: async () => ({ overflow: [], hiddenContent: [], clipped: [] }) };

/**
 * Evaluate the gate with the forensics stub injected (deterministic, no live modules).
 */
function gate(evidence, exp) {
  return evaluateGate(evidence, exp || expectations(), { forensicsModule: FORENSICS_STUB });
}

/**
 * Build a fully-passing evidence fixture.
 * @param {object} [overrides]
 * @returns {object}
 */
function passingEvidence(overrides) {
  return Object.assign(
    {
      engine: 'chrome-headless',
      virtualDom: false,
      realBrowser: true,
      targetId: 'target-real-1',
      capturedAt: NOW,
      commitSha: COMMIT,
      url: URL,
      screenshots: [
        { viewport: 390, width: 390, path: 'screenshot-390.png', sha256: 'a'.repeat(64), reviewable: true },
        { viewport: 768, width: 768, path: 'screenshot-768.png', sha256: 'b'.repeat(64), reviewable: true },
        { viewport: 1280, width: 1280, path: 'screenshot-1280.png', sha256: 'c'.repeat(64), reviewable: true },
      ],
      forensics: { overflow: [], hiddenContent: [], clipped: [] },
      consoleErrors: [],
      failedRequests: [],
    },
    overrides || {}
  );
}

/**
 * @returns {object} Expectations matching the passing fixture.
 */
function expectations() {
  return { url: URL, commitSha: COMMIT, viewports: [390, 768, 1280], lastChangeAt: LAST_CHANGE };
}

/**
 * Assert a blocking verdict and that a failure code is present.
 * @param {object} verdict
 * @param {string} code
 */
function assertBlocked(verdict, code) {
  assert.equal(verdict.ok, false, 'gate must not be ok');
  assert.equal(verdict.gateBlocked, true, 'gate must be blocked');
  assert.equal(verdict.verdict, 'fail', "verdict must be 'fail'");
  const codes = verdict.failures.map((f) => f.check);
  assert.ok(codes.includes(code), `expected failure code "${code}"; got [${codes.join(', ')}]`);
  for (const f of verdict.failures) {
    assert.equal(f.severity, 'blocker');
    assert.ok(f.detail && f.detail.length > 0);
  }
}

test('gate PASSES on fresh fully-passing fixture evidence', () => {
  const verdict = gate(passingEvidence(), expectations());
  assert.equal(verdict.ok, true);
  assert.equal(verdict.gateBlocked, false);
  assert.equal(verdict.verdict, 'pass');
  assert.deepEqual(verdict.failures, []);
});

test('gate BLOCKS on (a) missing mobile viewport evidence', () => {
  const ev = passingEvidence({
    screenshots: [
      { viewport: 768, width: 768, path: 's-768.png', sha256: 'b'.repeat(64), reviewable: true },
      { viewport: 1280, width: 1280, path: 's-1280.png', sha256: 'c'.repeat(64), reviewable: true },
    ],
  });
  const exp = { url: URL, commitSha: COMMIT, viewports: [768, 1280], lastChangeAt: LAST_CHANGE };
  assertBlocked(gate(ev, exp), 'missing_mobile_evidence');
});

test('gate BLOCKS when no viewport is at or below the mobile ceiling', () => {
  assert.ok(MOBILE_VIEWPORT_MAX <= 430, 'mobile ceiling must be ≤430px');
  const ev = passingEvidence({
    screenshots: [
      { viewport: 500, width: 500, path: 's-500.png', sha256: 'd'.repeat(64), reviewable: true },
    ],
  });
  const exp = { url: URL, commitSha: COMMIT, viewports: [500], lastChangeAt: LAST_CHANGE };
  assertBlocked(gate(ev, exp), 'missing_mobile_evidence');
});

test('gate BLOCKS on (b) stale commitSha', () => {
  const ev = passingEvidence({ commitSha: 'oldcommit000' });
  assertBlocked(gate(ev, expectations()), 'stale_commit');
});

test('gate BLOCKS on stale capture (capturedAt older than last code change)', () => {
  const ev = passingEvidence({ capturedAt: new Date(Date.now() - 3600 * 1000).toISOString() });
  assertBlocked(gate(ev, expectations()), 'stale_capture');
});

test('gate BLOCKS on (c) HIGH hidden-content finding', () => {
  const ev = passingEvidence({
    forensics: {
      overflow: [],
      hiddenContent: [{ selector: '.required-cta', severity: 'HIGH', detail: 'required CTA has display:none' }],
      clipped: [],
    },
  });
  assertBlocked(gate(ev, expectations()), 'hidden_content_high');
});

test('gate BLOCKS on (d) virtual-chrome marker (engine node-dom)', () => {
  const ev = passingEvidence({ engine: 'node-dom', virtualDom: true, realBrowser: false, targetId: null });
  assertBlocked(gate(ev, expectations()), 'virtual_chrome_detected');
});

test('gate BLOCKS on (e) console exceptions', () => {
  const ev = passingEvidence({ consoleErrors: [{ type: 'exception', text: 'Uncaught TypeError' }] });
  assertBlocked(gate(ev, expectations()), 'console_exceptions');
});

test('gate BLOCKS on failed required network requests', () => {
  const ev = passingEvidence({ failedRequests: [{ url: URL + '/api/data', status: 500 }] });
  assertBlocked(gate(ev, expectations()), 'failed_network_requests');
});

test('gate BLOCKS on horizontal overflow finding', () => {
  const ev = passingEvidence({ forensics: { overflow: ['body scrollWidth 420 > viewport 390'], hiddenContent: [], clipped: [] } });
  assertBlocked(gate(ev, expectations()), 'horizontal_overflow');
});

test('gate BLOCKS on clipped required content', () => {
  const ev = passingEvidence({ forensics: { overflow: [], hiddenContent: [], clipped: [{ selector: '.hero h1' }] } });
  assertBlocked(gate(ev, expectations()), 'clipped_required_content');
});

test('gate BLOCKS on screenshot not reviewable', () => {
  const ev = passingEvidence();
  ev.screenshots[0].reviewable = false;
  assertBlocked(gate(ev, expectations()), 'screenshot_not_reviewable');
});

test('gate BLOCKS on url mismatch', () => {
  const ev = passingEvidence({ url: 'https://example.test/other-route' });
  assertBlocked(gate(ev, expectations()), 'url_mismatch');
});

test('gate BLOCKS on missing evidence entirely (fail closed)', () => {
  assertBlocked(gate(null, expectations()), 'no_evidence');
});

test('gate BLOCKS when forensics scan result is missing (fail closed)', () => {
  const ev = passingEvidence({ forensics: null });
  assertBlocked(gate(ev, expectations()), 'forensics_missing');
});

test('gate verdict carries null bundle fields until the runner fills them', () => {
  const verdict = gate(passingEvidence(), expectations());
  assert.equal(verdict.proofBundleDir, null);
  assert.equal(verdict.receiptPath, null);
});

test('gate BLOCKS with forensics_module_missing when the sibling module is absent', () => {
  // No forensicsModule injected (and none resolvable on disk in this fixture
  // context) => the gate must fail closed, never silently pass.
  const verdict = evaluateGate(passingEvidence(), expectations(), { forensicsModule: null });
  assertBlocked(verdict, 'forensics_module_missing');
});
