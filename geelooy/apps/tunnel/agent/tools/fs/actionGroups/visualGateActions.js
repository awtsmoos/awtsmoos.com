// B"H
// Boruch Hashem
// Blessed is He

'use strict';

/**
 * visualGateActions.js — BLOCKING visual verification gate.
 *
 * This gate stands between "frontend work edited" and "done". It runs a
 * fresh cold-target verification sequence (navigate → per-viewport
 * screenshot with provenance → CSS forensics → console/network error scan)
 * and returns a verdict. The verdict is FAIL-CLOSED: ANY uncertainty —
 * missing evidence, virtual-chrome engine, stale evidence, missing mobile
 * viewport, unreviewable screenshots, console exceptions, failed required
 * requests, overflow / hidden-content / clipped findings — blocks the gate
 * (ok:false, gateBlocked:true, verdict:'fail').
 *
 * Sibling modules (built in parallel by other workers) are required
 * DEFENSIVELY. If cssForensics.js is absent the gate fails closed with
 * error "forensics_module_missing" — it never silently passes.
 *
 * Doctrine tie-in: only after visualGateCheck returns {ok:true,
 * verdict:'pass'} may an agent claim "fixed" / "verified" / "live".
 * Anything less is reported with precise language such as "source test
 * passed" or "candidate browser geometry passed".
 */

const path = require('path');

// ---------------------------------------------------------------------------
// Defensive requires of sibling modules built in parallel by other workers.
// Absent module => gate fails closed (never silently passes).
// ---------------------------------------------------------------------------

/** @type {object|null} */
let cssForensics = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  cssForensics = require('../../chrome/cssForensics.js');
} catch (e) {
  cssForensics = null;
}

/** @type {object|null} */
let visionDelivery = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  visionDelivery = require('../../chrome/visionDelivery.js');
} catch (e) {
  visionDelivery = null;
}

let proofBundle = null;
try {
  // eslint-disable-next-line global-require
  proofBundle = require('../../chrome/proofBundle.js');
} catch (e) {
  proofBundle = null;
}

/** Mobile viewport ceiling in CSS px: evidence must include a viewport ≤ this. */
const MOBILE_VIEWPORT_MAX = 430;

/**
 * Resolve the tunnel repo ROOT for bundle placement (<ROOT>/.awtsmoos/...),
 * mirroring agent/tools/chrome/extras.js. Falls back to process.cwd().
 * @returns {string}
 */
function repoRoot() {
  try {
    // eslint-disable-next-line global-require
    const config = require('../../../lib/config.js');
    if (config && config.ROOT) return config.ROOT;
  } catch (e) { /* fall through to cwd */ }
  return process.cwd();
}

/**
 * @typedef {object} GateFailure
 * @property {string} check - Machine-readable failure code.
 * @property {string} severity - 'blocker' (always for gate failures).
 * @property {string} detail - Human-readable explanation.
 */

/**
 * @typedef {object} GateVerdict
 * @property {boolean} ok - True only when the gate passes.
 * @property {boolean} gateBlocked - True when the gate blocks "done".
 * @property {'pass'|'fail'} verdict
 * @property {GateFailure[]} failures
 * @property {string|null} proofBundleDir
 * @property {string|null} receiptPath
 */

/**
 * Append a blocker failure.
 * @param {GateFailure[]} failures
 * @param {string} check
 * @param {string} detail
 */
function block(failures, check, detail) {
  failures.push({ check, severity: 'blocker', detail: String(detail) });
}

/**
 * Pure gate evaluation over gathered evidence. Fail-closed: every
 * uncertainty becomes a blocker failure.
 *
 * @param {object|null} evidence - Gathered verification evidence. Shape:
 *   { engine, virtualDom, realBrowser, targetId, capturedAt (ISO),
 *     commitSha, url, viewportEmulation:'ok'|'unsupported',
 *     screenshots:[{viewport,width,emulated,path,sha256,reviewable}],
 *     forensics:{ overflow:[], hiddenContent:[{severity}], clipped:[] },
 *     consoleErrors:[], failedRequests:[] }
 * @param {object} expectations - { url, commitSha, viewports:[widths], lastChangeAt (ISO|null) }
 * @param {object} [opts] - { forensicsModule } override for the CSS forensics
 *   module (tests inject a stub; production uses the defensively-required module).
 * @returns {GateVerdict} Verdict with ok/gateBlocked/verdict/failures (proofBundleDir/receiptPath filled by caller).
 */
function evaluateGate(evidence, expectations, opts) {
  const failures = [];
  const exp = expectations || {};
  const expectedUrl = exp.url || null;
  const expectedCommit = exp.commitSha || null;
  const expectedViewports = Array.isArray(exp.viewports) && exp.viewports.length ? exp.viewports : [390, 768, 1280];
  const lastChangeAt = exp.lastChangeAt || null;
  const forensicsModule = (opts && 'forensicsModule' in opts) ? opts.forensicsModule : cssForensics;
  const hasForensics = Boolean(forensicsModule && typeof forensicsModule.scanConflicts === 'function');

  // 0. Sibling forensics module must exist — otherwise fail closed.
  if (!hasForensics) {
    block(failures, 'forensics_module_missing',
      'cssForensics.js is not available; conflict/overflow/hidden-content analysis cannot run, so the gate cannot pass.');
  }

  // 1. Evidence must exist at all.
  if (!evidence || typeof evidence !== 'object') {
    block(failures, 'no_evidence', 'No verification evidence was gathered.');
    return finalize(false, failures);
  }

  // 2. Virtual-chrome engine detection: never trust a simulated DOM.
  const engine = evidence.engine || '';
  if (evidence.virtualDom === true || engine === 'node-dom' || /virtual/i.test(engine)) {
    block(failures, 'virtual_chrome_detected',
      `Evidence came from a virtual-chrome engine (${engine || 'virtualDom:true'}); no real rendering occurred.`);
  }

  // 3. Real-browser run required (real target id, explicitly flagged).
  if (evidence.realBrowser !== true || !evidence.targetId) {
    block(failures, 'no_real_browser_run',
      'No real-browser run: evidence lacks a real browser target id (targetId) or realBrowser flag.');
  }

  // 4. URL must match the route under verification.
  if (expectedUrl && evidence.url !== expectedUrl) {
    block(failures, 'url_mismatch',
      `Evidence url "${evidence.url || '(missing)'}" does not match expected route "${expectedUrl}".`);
  }

  // 5. Commit SHA binding: stale evidence is rejected.
  if (!evidence.commitSha) {
    block(failures, 'stale_evidence', 'Evidence carries no commitSha; it cannot be tied to the code under test.');
  } else if (expectedCommit && evidence.commitSha !== expectedCommit) {
    block(failures, 'stale_commit',
      `Evidence commitSha "${evidence.commitSha}" !== expected "${expectedCommit}".`);
  }

  // 6. Freshness: capturedAt must exist and must not predate the last relevant code change.
  if (!evidence.capturedAt) {
    block(failures, 'stale_evidence', 'Evidence has no capturedAt timestamp; freshness cannot be established.');
  } else {
    const captured = Date.parse(evidence.capturedAt);
    if (Number.isNaN(captured)) {
      block(failures, 'stale_evidence', `Evidence capturedAt "${evidence.capturedAt}" is not a valid timestamp.`);
    } else if (lastChangeAt) {
      const changed = Date.parse(lastChangeAt);
      if (!Number.isNaN(changed) && captured < changed) {
        block(failures, 'stale_capture',
          `Evidence captured at ${evidence.capturedAt} predates the last relevant code change (${lastChangeAt}).`);
      }
    }
  }

  // 7. Screenshot evidence per expected viewport.
  const shots = Array.isArray(evidence.screenshots) ? evidence.screenshots : [];
  for (const width of expectedViewports) {
    const shot = shots.find((s) => Number(s && s.width) === Number(width));
    if (!shot) {
      block(failures, 'screenshot_missing', `No screenshot evidence for viewport width ${width}px.`);
      continue;
    }
    if (!shot.path && !shot.sha256) {
      block(failures, 'screenshot_missing', `Screenshot for ${width}px has no path or sha256.`);
    }
    if (shot.reviewable !== true) {
      // Fail closed: reviewability must be affirmative, not assumed.
      block(failures, 'screenshot_not_reviewable',
        `Screenshot for ${width}px is not affirmatively reviewable (not delivered to a vision-capable reviewer).`);
    }
  }

  // 8. Mobile (≤430px) evidence is mandatory.
  const hasMobile = shots.some((s) => Number(s && s.width) <= MOBILE_VIEWPORT_MAX);
  if (!hasMobile) {
    block(failures, 'missing_mobile_evidence',
      `No screenshot evidence at a mobile viewport (≤${MOBILE_VIEWPORT_MAX}px).`);
  }

  // 8b. Viewport widths must be enforced, not assumed.
  if (evidence.viewportEmulation === 'unsupported') {
    block(failures, 'viewport_emulation_unsupported',
      'The chrome layer has no viewport-emulation capability, so per-viewport widths cannot be enforced; width claims are unverifiable.');
  }

  // 9. Console exceptions block.
  const consoleErrors = Array.isArray(evidence.consoleErrors) ? evidence.consoleErrors : null;
  if (consoleErrors === null) {
    block(failures, 'console_scan_missing', 'Console-error scan did not run or returned no usable result.');
  } else if (consoleErrors.length > 0) {
    block(failures, 'console_exceptions',
      `${consoleErrors.length} console exception(s)/error(s) captured during verification.`);
  }

  // 10. Failed required network requests block.
  const failedRequests = Array.isArray(evidence.failedRequests) ? evidence.failedRequests : null;
  if (failedRequests === null) {
    block(failures, 'network_scan_missing', 'Network-error scan did not run or returned no usable result.');
  } else if (failedRequests.length > 0) {
    block(failures, 'failed_network_requests',
      `${failedRequests.length} required network request(s) failed during verification.`);
  }

  // 11. CSS forensics findings block.
  const forensics = evidence.forensics || null;
  if (hasForensics) {
    if (forensics === null) {
      block(failures, 'forensics_missing', 'CSS forensics scan did not produce a result.');
    } else {
      const overflow = Array.isArray(forensics.overflow) ? forensics.overflow : null;
      if (overflow === null) {
        block(failures, 'forensics_missing', 'Forensics result has no horizontal-overflow analysis.');
      } else if (overflow.length > 0) {
        block(failures, 'horizontal_overflow',
          `${overflow.length} horizontal-overflow finding(s): ${overflow.slice(0, 3).map(String).join('; ')}.`);
      }
      const hidden = Array.isArray(forensics.hiddenContent) ? forensics.hiddenContent : null;
      if (hidden === null) {
        block(failures, 'forensics_missing', 'Forensics result has no hidden-content analysis.');
      } else {
        const high = hidden.filter((h) => h && String(h.severity).toUpperCase() === 'HIGH');
        if (high.length > 0) {
          block(failures, 'hidden_content_high',
            `${high.length} HIGH hidden-content finding(s): required content is hidden from users.`);
        }
      }
      const clipped = Array.isArray(forensics.clipped) ? forensics.clipped : null;
      if (clipped === null) {
        block(failures, 'forensics_missing', 'Forensics result has no clipped-content analysis.');
      } else if (clipped.length > 0) {
        block(failures, 'clipped_required_content',
          `${clipped.length} clipped-required-content finding(s).`);
      }
    }
  }

  return finalize(failures.length === 0, failures);

  /**
   * @param {boolean} pass
   * @param {GateFailure[]} list
   * @returns {GateVerdict}
   */
  function finalize(pass, list) {
    return {
      ok: pass,
      gateBlocked: !pass,
      verdict: pass ? 'pass' : 'fail',
      failures: list,
      proofBundleDir: null,
      receiptPath: null,
    };
  }
}

/**
 * Build the live dependency set from the action context.
 * Kept small and defensive: any missing capability surfaces as
 * evidence gaps, which fail the gate closed.
 * @param {object} ctx - Action context ({ config, payload } and any chrome action surface).
 * @returns {object} deps
 */
function makeLiveDeps(ctx) {
  const c = ctx || {};
  return {
    ctx: c,
    chrome: c.chrome || c.actions || null,
    proofBundle,
    cssForensics,
    visionDelivery,
    nowIso: () => new Date().toISOString(),
  };
}

/**
 * Run the full visual-gate sequence against a live target.
 *
 * Steps: fresh cold target → navigate → per viewport: screenshot with
 * provenance (visionDelivery when present, else chromeScreenshot) →
 * cssForensics.scanConflicts → console/network error scan → proof bundle →
 * evaluateGate → receipt.
 *
 * @param {object} payload - { url, viewports=[390,768,1280], commitSha, runId, lastChangeAt }
 * @param {object} deps - Dependency set (see makeLiveDeps); tests inject fixtures.
 * @returns {Promise<GateVerdict>}
 */
async function runVisualGateCheck(payload, deps) {
  const p = payload || {};
  const d = deps || {};
  const failures = [];
  const viewports = Array.isArray(p.viewports) && p.viewports.length ? p.viewports : [390, 768, 1280];

  if (!p.url) block(failures, 'missing_url', 'visualGateCheck requires payload.url.');
  if (!p.commitSha) block(failures, 'missing_commit', 'visualGateCheck requires payload.commitSha.');
  if (!cssForensics || typeof cssForensics.scanConflicts !== 'function') {
    block(failures, 'forensics_module_missing',
      'cssForensics.js is not available; the gate cannot run its conflict analysis and fails closed.');
  }

  const runId = p.runId || `vg-${Date.now().toString(36)}`;
  let bundle = null;
  let bundleDir = null;
  if (proofBundle && failures.length === 0) {
    try {
      bundle = await proofBundle.openBundle({
        runId,
        commitSha: p.commitSha,
        route: p.url,
        environment: p.environment || {},
        root: repoRoot(),
      });
      bundleDir = bundle.dir;
    } catch (e) {
      block(failures, 'bundle_open_failed', `Could not open proof bundle: ${e && e.message}`);
    }
  }

  /** @type {object|null} */
  let evidence = null;
  if (failures.length === 0) {
    try {
      evidence = await gatherEvidence(p, d, bundle, viewports);
    } catch (e) {
      block(failures, 'evidence_gather_failed',
        `Evidence gathering threw: ${e && e.message}. Failing closed.`);
    }
  }

  let verdict = evaluateGate(evidence, {
    url: p.url,
    commitSha: p.commitSha,
    viewports,
    lastChangeAt: p.lastChangeAt || null,
  }, { forensicsModule: cssForensics });
  // Merge pre-evaluation failures (missing payload fields, bundle errors).
  verdict.failures = failures.concat(verdict.failures);
  if (verdict.failures.length > 0) {
    verdict.ok = false;
    verdict.gateBlocked = true;
    verdict.verdict = 'fail';
  }
  verdict.proofBundleDir = bundleDir;

  if (bundle) {
    try {
      await proofBundle.closeBundle(bundle, { verdict: verdict.verdict });
      verdict.receiptPath = await writeReceipt(bundleDir, verdict, p);
    } catch (e) {
      block(verdict.failures, 'receipt_write_failed', `Could not finalize bundle/receipt: ${e && e.message}`);
      verdict.ok = false;
      verdict.gateBlocked = true;
      verdict.verdict = 'fail';
    }
  }

  return verdict;
}

/**
 * Gather raw evidence from a fresh cold target.
 * Any step that cannot be performed leaves its evidence slot empty —
 * evaluateGate then fails closed on the gap.
 *
 * @param {object} p - Gate payload.
 * @param {object} d - Deps.
 * @param {object|null} bundle - Proof bundle handle.
 * @param {number[]} viewports
 * @returns {Promise<object>} Evidence object for evaluateGate.
 */
async function gatherEvidence(p, d, bundle, viewports) {
  const chrome = d.chrome || {};
  const evidence = {
    engine: null,
    virtualDom: false,
    realBrowser: false,
    targetId: null,
    capturedAt: (d.nowIso || (() => new Date().toISOString()))(),
    commitSha: p.commitSha,
    url: p.url,
    screenshots: [],
    forensics: null,
    consoleErrors: null,
    failedRequests: null,
  };

  const call = async (name, args) => {
    const fn = chrome[name];
    if (typeof fn !== 'function') throw new Error(`chrome_action_missing:${name}`);
    return fn(args || {});
  };

  // Fresh cold target: new page, cache bypassed. Any failure => evidence gap.
  let targetId = null;
  try {
    const opened = await call('chromeNewPage', { url: p.url, cold: true, bypassCache: true });
    targetId = (opened && (opened.targetId || opened.target_id)) || null;
    evidence.engine = (opened && (opened.engine || opened.virtualDom === true)) || null;
    evidence.virtualDom = Boolean(opened && opened.virtualDom === true);
    evidence.realBrowser = Boolean(targetId && !evidence.virtualDom && evidence.engine !== 'node-dom');
  } catch (e) {
    evidence.engine = `target_open_failed:${e && e.message}`;
  }
  evidence.targetId = targetId;
  if (bundle && proofBundle) {
    proofBundle.bundleSetTarget(bundle, targetId);
    await proofBundle.bundleAddJson(bundle, 'target.json', {
      targetId, engine: evidence.engine, virtualDom: evidence.virtualDom, url: p.url,
    });
  }

  // Navigate (cold) on the fresh target.
  try {
    await call('chromeNavigate', { url: p.url, targetId, waitUntil: 'networkidle' });
  } catch (e) {
    // Navigation failure leaves everything downstream empty => gate fails.
    evidence.navigationError = String((e && e.message) || e);
    return evidence;
  }

  // Per-viewport: screenshot with provenance (+ bundle the bytes), forensics, logs.
  // Viewport emulation requires a chrome viewport-emulation capability. If it
  // is absent, widths cannot be enforced and the gate fails closed on the gap.
  let viewportEmulation = 'ok';
  const allConsole = [];
  const allFailed = [];
  let mergedForensics = { overflow: [], hiddenContent: [], clipped: [] };
  for (const width of viewports) {
    let emulated = false;
    try {
      await call('chromeEmulateViewport', { targetId, width, deviceScaleFactor: 2 });
      emulated = true;
    } catch (e) {
      viewportEmulation = 'unsupported'; // width claim unverifiable => fail closed
    }

    let shot = null;
    try {
      if (visionDelivery && typeof visionDelivery.captureReviewable === 'function') {
        shot = await visionDelivery.captureReviewable({ targetId, url: p.url, width, commitSha: p.commitSha });
      } else {
        shot = await call('chromeScreenshot', { targetId, inline: true, fullPage: false });
      }
    } catch (e) {
      shot = { error: String((e && e.message) || e) };
    }

    const record = {
      viewport: width,
      width,
      emulated,
      path: (shot && (shot.savedPath || shot.path)) || null,
      sha256: (shot && (shot.sha256 || shot.bytesSha256)) || null,
      reviewable: Boolean(shot && shot.reviewable === true),
      capturedAt: evidence.capturedAt,
      commitSha: p.commitSha,
      url: p.url,
      targetId,
    };
    // chromeScreenshot inline:true returns content64 bytes; bundle them when present.
    if (bundle && proofBundle && shot && shot.content64) {
      try {
        const added = await proofBundle.bundleAddFile(
          bundle, `screenshot-${width}.png`, Buffer.from(shot.content64, 'base64'), 'image/png');
        record.path = added.path;
        record.sha256 = added.sha256;
      } catch (e) { /* bundling gap => sha256 stays null => gate fails on missing provenance */ }
    }
    evidence.screenshots.push(record);
    if (bundle && proofBundle) {
      proofBundle.bundleAddViewport(bundle, width);
      await proofBundle.bundleAddJson(bundle, `screenshot-${width}.provenance.json`, record);
    }

    // CSS forensics per viewport.
    if (cssForensics && typeof cssForensics.scanConflicts === 'function') {
      try {
        const found = await cssForensics.scanConflicts({ targetId, width, url: p.url });
        if (found) {
          if (Array.isArray(found.overflow)) mergedForensics.overflow.push(...found.overflow);
          if (Array.isArray(found.hiddenContent)) mergedForensics.hiddenContent.push(...found.hiddenContent);
          if (Array.isArray(found.clipped)) mergedForensics.clipped.push(...found.clipped);
        }
        if (bundle && proofBundle) {
          await proofBundle.bundleAddJson(bundle, `forensics-${width}.json`, found || { note: 'empty' });
        }
      } catch (e) {
        mergedForensics = null; // scan failure => forensics gap => gate fails closed
        break;
      }
    }
  }
  evidence.forensics = mergedForensics;
  evidence.viewportEmulation = viewportEmulation;

  // Console + network error scan.
  try {
    const logs = await call('chromeLogs', { targetId });
    const entries = (logs && (logs.logs || logs.entries)) || [];
    for (const entry of entries) {
      const text = JSON.stringify(entry);
      if (/exception|uncaught|console\.error|"level":"error"/i.test(text)) allConsole.push(entry);
    }
    evidence.consoleErrors = allConsole;
  } catch (e) {
    evidence.consoleErrors = null; // gap => fail closed
  }
  try {
    const net = await call('chromeNetwork', { targetId });
    const entries = (net && (net.entries || net.requests)) || [];
    evidence.failedRequests = entries.filter((r) => {
      const status = Number(r && (r.status || r.responseStatus));
      return (r && r.failed === true) || (status >= 400);
    });
  } catch (e) {
    evidence.failedRequests = null; // gap => fail closed
  }

  if (bundle && proofBundle) {
    await proofBundle.bundleAddJson(bundle, 'console-errors.json', evidence.consoleErrors || { gap: true });
    await proofBundle.bundleAddJson(bundle, 'failed-requests.json', evidence.failedRequests || { gap: true });
    await proofBundle.bundleAddJson(bundle, 'evidence.json', evidence);
  }

  return evidence;
}

/**
 * Compute a SHA-256 "signature" binding the verdict to the bundle.
 * @param {object} verdict
 * @returns {string} Hex digest.
 */
function signVerdict(verdict) {
  const crypto = require('crypto');
  const canonical = JSON.stringify({
    verdict: verdict.verdict,
    failures: verdict.failures,
    proofBundleDir: verdict.proofBundleDir,
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}

/**
 * Persist the signed gate receipt JSON at the bundle dir.
 * @param {string} bundleDir
 * @param {GateVerdict} verdict
 * @param {object} payload - Original gate payload (for route/commit binding).
 * @returns {Promise<string|null>} Receipt path or null when no bundle dir.
 */
async function writeReceipt(bundleDir, verdict, payload) {
  if (!bundleDir) return null;
  const fsp = require('fs').promises;
  const receipt = {
    kind: 'visual-gate-receipt',
    verdict: verdict.verdict,
    ok: verdict.ok,
    gateBlocked: verdict.gateBlocked,
    failures: verdict.failures,
    route: (payload && payload.url) || null,
    commitSha: (payload && payload.commitSha) || null,
    proofBundleDir: bundleDir,
    signedAt: new Date().toISOString(),
    receiptSha256: signVerdict(verdict),
  };
  const receiptPath = path.join(bundleDir, 'visual-gate-receipt.json');
  await fsp.writeFile(receiptPath, JSON.stringify(receipt, null, 2), 'utf8');
  return receiptPath;
}

/**
 * Action: persist (or re-persist) the signed verdict JSON for a gate run.
 * Expects payload { proofBundleDir, verdict } where verdict is a GateVerdict.
 * @param {object} payload
 * @returns {Promise<{ok:boolean, receiptPath:string|null, error?:string}>}
 */
async function runVisualGateReceipt(payload) {
  const p = payload || {};
  if (!p.proofBundleDir || !p.verdict) {
    return { ok: false, receiptPath: null, error: 'visualGateReceipt requires {proofBundleDir, verdict}.' };
  }
  try {
    const receiptPath = await writeReceipt(p.proofBundleDir, p.verdict, p);
    return { ok: true, receiptPath };
  } catch (e) {
    return { ok: false, receiptPath: null, error: String((e && e.message) || e) };
  }
}

/**
 * Build the tunnel action surface for the visual gate.
 * Follows the build*Actions(ctx) convention used by the other
 * agent/tools/fs/actionGroups modules (e.g. buildFileTransferActions):
 * the builder destructures { config, payload } and returns a map of
 * action names to zero-argument async handlers closing over them.
 *
 * @param {object} ctx - Action context; destructured as { config, payload }.
 * @returns {{visualGateCheck:function, visualGateReceipt:function}}
 */
function buildVisualGateActions({ config, payload }) {
  return {
    /**
     * Run the blocking visual gate over the payload
     * { url, viewports, commitSha, runId, lastChangeAt, environment }.
     */
    visualGateCheck: async () => runVisualGateCheck(payload || {}, makeLiveDeps({ config, payload })),
    /**
     * Persist the signed gate receipt: payload { proofBundleDir, verdict, url, commitSha }.
     */
    visualGateReceipt: async () => runVisualGateReceipt(payload || {}),
  };
}

module.exports = {
  buildVisualGateActions,
  // Exported for fixture-driven tests (no live browser needed):
  evaluateGate,
  runVisualGateCheck,
  runVisualGateReceipt,
  MOBILE_VIEWPORT_MAX,
};
