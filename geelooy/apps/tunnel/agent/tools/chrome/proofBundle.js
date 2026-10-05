// B"H
// Boruch Hashem
// Blessed is He

'use strict';

/**
 * proofBundle.js — evidence proof bundles for visual verification runs.
 *
 * A proof bundle is a directory on the Mac at
 *   <ROOT>/.awtsmoos/verification/<runId>/
 * collecting every artifact produced by a visual-gate run: screenshots,
 * CSS forensics, console/network logs, and the signed verdict. Every
 * artifact is SHA-256 bound in manifest.json so a "pass" claim can be
 * re-checked against exactly the bytes that were captured.
 *
 * Fail-closed posture: the manifest binds runId + commitSha + route +
 * browserTargetId. Evidence that cannot be tied to the code under test
 * is rejected by the visual gate (see visualGateActions.js), never passed.
 */

const crypto = require('crypto');
const fsp = require('fs').promises;
const path = require('path');

/**
 * Compute the SHA-256 hex digest of a buffer.
 * @param {Buffer} buffer - Bytes to hash.
 * @returns {string} Lowercase hex digest.
 */
function sha256(buffer) {
  return crypto.createHash('sha256').update(buffer).digest('hex');
}

/**
 * Normalize an artifact name so it can never escape the bundle directory.
 * Strict: any path traversal or absolute-path attempt is REJECTED, not
 * silently rewritten — fail closed on hostile input.
 * @param {string} name - Caller-supplied artifact name.
 * @returns {string} Sanitized relative path inside the bundle.
 * @throws {Error} When the name would escape the bundle dir.
 */
function safeArtifactName(name) {
  const raw = String(name).trim();
  if (!raw) throw new Error('proof_bundle_bad_name');
  if (raw.includes('..') || raw.startsWith('/') || raw.startsWith('\\') || path.isAbsolute(raw)) {
    throw new Error('proof_bundle_bad_name');
  }
  const normalized = path.normalize(raw);
  if (normalized === '.' || normalized.startsWith('..') || path.isAbsolute(normalized)) {
    throw new Error('proof_bundle_bad_name');
  }
  return normalized;
}

/**
 * Open a new proof bundle: create the run directory and return the handle.
 *
 * @param {object} opts
 * @param {string} opts.runId - Unique id for this verification run.
 * @param {string} opts.commitSha - Commit SHA of the code under test.
 * @param {string} opts.route - Route/URL being verified.
 * @param {object} [opts.environment] - Environment descriptor (browser, os, …).
 * @param {string} [opts.root] - Tunnel ROOT override (defaults to process.cwd()).
 * @returns {Promise<object>} Bundle handle {runId, commitSha, route, environment, dir, artifacts, viewports, browserTargetId, openedAt}.
 * @throws {Error} When runId/commitSha/route are missing.
 */
async function openBundle({ runId, commitSha, route, environment, root }) {
  if (!runId || !commitSha || !route) {
    throw new Error('proof_bundle_missing_identity');
  }
  const dir = path.join(root || process.cwd(), '.awtsmoos', 'verification', String(runId));
  await fsp.mkdir(dir, { recursive: true });
  return {
    runId: String(runId),
    commitSha: String(commitSha),
    route: String(route),
    environment: environment || {},
    dir,
    artifacts: [],
    viewports: [],
    browserTargetId: null,
    openedAt: new Date().toISOString(),
  };
}

/**
 * Record a viewport that was exercised during this run.
 * @param {object} bundle - Handle from openBundle.
 * @param {number} width - Viewport width in CSS px.
 * @param {number} [height] - Viewport height in CSS px.
 * @returns {object} The bundle handle (for chaining).
 */
function bundleAddViewport(bundle, width, height) {
  bundle.viewports.push({ width: Number(width), height: height == null ? null : Number(height) });
  return bundle;
}

/**
 * Set the real-browser target id the evidence was captured from.
 * @param {object} bundle - Handle from openBundle.
 * @param {string} targetId - CDP target id (must be a real browser target).
 * @returns {object} The bundle handle (for chaining).
 */
function bundleSetTarget(bundle, targetId) {
  bundle.browserTargetId = targetId == null ? null : String(targetId);
  return bundle;
}

/**
 * Write a JSON artifact into the bundle and bind it by SHA-256.
 * @param {object} bundle - Handle from openBundle.
 * @param {string} name - Artifact file name (e.g. "forensics-390.json").
 * @param {object} obj - JSON-serializable payload.
 * @returns {Promise<{path:string, sha256:string}>} Relative path + hex digest.
 */
async function bundleAddJson(bundle, name, obj) {
  const rel = safeArtifactName(name);
  const text = JSON.stringify(obj, null, 2);
  const full = path.join(bundle.dir, rel);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, text, 'utf8');
  const digest = sha256(Buffer.from(text, 'utf8'));
  const record = { name: rel, sha256: digest, mime: 'application/json' };
  bundle.artifacts.push(record);
  return { path: rel, sha256: digest };
}

/**
 * Write a binary artifact into the bundle and bind it by SHA-256.
 * @param {object} bundle - Handle from openBundle.
 * @param {string} name - Artifact file name (e.g. "screenshot-390.png").
 * @param {Buffer} buffer - Raw bytes.
 * @param {string} [mime] - MIME type (default application/octet-stream).
 * @returns {Promise<{path:string, sha256:string}>} Relative path + hex digest.
 */
async function bundleAddFile(bundle, name, buffer, mime) {
  const rel = safeArtifactName(name);
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const full = path.join(bundle.dir, rel);
  await fsp.mkdir(path.dirname(full), { recursive: true });
  await fsp.writeFile(full, buf);
  const digest = sha256(buf);
  const record = { name: rel, sha256: digest, mime: mime || 'application/octet-stream' };
  bundle.artifacts.push(record);
  return { path: rel, sha256: digest };
}

/**
 * Close the bundle: write manifest.json binding runId + commitSha + route +
 * browserTargetId + every artifact's SHA-256, plus visual-review.json and
 * production-proof.json placeholders.
 *
 * @param {object} bundle - Handle from openBundle.
 * @param {object} [opts]
 * @param {string} [opts.verdict] - 'pass' | 'fail'.
 * @param {object} [opts.visualReview] - Review record (reviewer, decision, notes).
 * @param {object} [opts.extra] - Extra manifest fields (e.g. gate failures).
 * @returns {Promise<{dir:string, manifestPath:string, sha256:string}>}
 */
async function closeBundle(bundle, { verdict, visualReview, extra } = {}) {
  const timestamp = new Date().toISOString();
  const manifest = {
    runId: bundle.runId,
    commitSha: bundle.commitSha,
    route: bundle.route,
    browserTargetId: bundle.browserTargetId,
    timestamp,
    environment: bundle.environment,
    viewports: bundle.viewports,
    artifacts: bundle.artifacts,
    verdict: verdict || 'fail',
  };
  if (extra && typeof extra === 'object') Object.assign(manifest, extra);

  const manifestText = JSON.stringify(manifest, null, 2);
  const manifestPath = path.join(bundle.dir, 'manifest.json');
  await fsp.writeFile(manifestPath, manifestText, 'utf8');

  const visualReviewDoc = {
    runId: bundle.runId,
    reviewedAt: null,
    reviewer: null,
    decision: (visualReview && visualReview.decision) || 'unreviewed',
    notes: (visualReview && visualReview.notes) || null,
  };
  await fsp.writeFile(
    path.join(bundle.dir, 'visual-review.json'),
    JSON.stringify(visualReviewDoc, null, 2),
    'utf8'
  );

  const productionProofDoc = {
    runId: bundle.runId,
    generatedAt: timestamp,
    commitSha: bundle.commitSha,
    route: bundle.route,
    verdict: manifest.verdict,
    manifestSha256: sha256(Buffer.from(manifestText, 'utf8')),
    note: 'production-proof placeholder: populate when the gate verdict is consumed by release.',
  };
  await fsp.writeFile(
    path.join(bundle.dir, 'production-proof.json'),
    JSON.stringify(productionProofDoc, null, 2),
    'utf8'
  );

  return {
    dir: bundle.dir,
    manifestPath,
    sha256: sha256(Buffer.from(manifestText, 'utf8')),
  };
}

module.exports = {
  openBundle,
  bundleAddViewport,
  bundleSetTarget,
  bundleAddJson,
  bundleAddFile,
  closeBundle,
  sha256,
};
