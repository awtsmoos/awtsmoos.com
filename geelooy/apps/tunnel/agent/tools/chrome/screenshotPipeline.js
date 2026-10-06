// B"H
/**
 * @file Fresh-target screenshot pipeline for the tunnel chrome tools.
 *
 * @description
 * The missing pipeline leg between "take a screenshot" and "a reviewer can
 * trust the pixels". `chromeScreenshot` (extras.js) captures whatever page
 * happens to be open; this module owns the full first-class workflow:
 *
 *   fresh Chrome target -> navigate to the EXACT url -> set the EXACT
 *   viewport -> wait for a readiness condition -> capture a real PNG ->
 *   SHA-256 of the bytes -> deterministic (content-addressed) evidence path
 *   on Mac disk -> PNG bytes delivered inline to the AI caller -> REAL image
 *   artifact (dataUrl), never just a hash, plus a visual-review receipt.
 *
 * "Transfer to AI-accessible location" is the inline dataUrl: the action
 * result carries the actual PNG bytes, so a remote AI harness (no shared
 * filesystem with the Mac) can still SEE the page. The on-disk evidence
 * directory is the durable audit copy; the sidecar JSON next to each PNG is
 * the complete provenance record (url, final url, viewport, commit, moment).
 *
 * Preview-link verification path (Worker E integration): when the payload
 * carries `preview.port`, the pipeline mints a short-lived bearer preview
 * link for the Mac localhost serve, probes whether the live relay actually
 * forwards /api/tunnel/preview, and captures through the preview URL with
 * the bearer token -- the exact URL a remote viewer would open. The token
 * itself NEVER touches evidence, logs, or results, and the link is revoked
 * afterwards. If the relay does not implement the preview route (the case
 * today), the flow falls back to a direct-URL capture of
 * http://127.0.0.1:port/path and labels the evidence honestly.
 *
 * Every stage fails closed: missing/invalid url, unavailable chrome,
 * readiness timeout, empty or non-PNG bytes all return ok:false with a
 * precise error instead of certifying anything.
 *
 * @example
 * const { runScreenshotPipeline } = require("./screenshotPipeline.js");
 * const res = await runScreenshotPipeline({
 *   url: "https://awtsmoos.com/heichelos/ikar",
 *   viewport: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
 *   readyExpression: "document.fonts && document.fonts.status === 'loaded'",
 * });
 * // res = { ok:true, action:"chromeScreenshotPipeline", dataUrl, sha256,
 * //         bytes, evidence, requiresVisualReview:true, visualReviewNote }
 */

const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");
const { execFile } = require("child_process");
const { ROOT } = require("../../lib/config.js");
const cdp = require("./cdp.js");
const extras = require("./extras.js");

/** Evidence lives under the tunnel ROOT, content-addressed by SHA-256. */
const EVIDENCE_SUBDIR = ".awtsmoos/chrome/evidence";
const SHA256_RE = /^[0-9a-f]{64}$/;
/** Verdicts a reviewer may sign on a review receipt. */
const REVIEW_VERDICTS = ["pass", "fail", "needs-work"];
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * SHA-256 hex of a buffer.
 * @param {Buffer} buf
 * @returns {string}
 */
function sha256hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Clamp an integer viewport dimension into a sane range.
 * @param {*} value
 * @param {number} min
 * @param {number} max
 * @param {number} fallback
 * @returns {number}
 */
function clampInt(value, min, max, fallback) {
  const n = Math.floor(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, n));
}

/**
 * Normalize a viewport payload into exact CDP device metrics. Narrow
 * widths (<=430 CSS px) imply a mobile viewport unless stated otherwise.
 * @param {object} [v={}]
 * @returns {{width:number,height:number,deviceScaleFactor:number,mobile:boolean}}
 */
function normalizeViewport(v = {}) {
  const width = clampInt(v.width, 200, 4096, 1280);
  const height = clampInt(v.height, 200, 4096, 800);
  const dsfRaw = Number(v.deviceScaleFactor);
  const deviceScaleFactor = Number.isFinite(dsfRaw)
    ? Math.max(0.5, Math.min(4, dsfRaw))
    : 1;
  const mobile = v.mobile === undefined ? width <= 430 : v.mobile === true;
  return { width, height, deviceScaleFactor, mobile };
}

/**
 * Clamp a timeout payload into [1000, max].
 * @param {*} value
 * @param {number} max
 * @returns {number}
 */
function clampTimeout(value, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return max;
  return Math.max(1000, Math.min(max, n));
}

/**
 * Best-effort commit SHA for provenance; never throws, never blocks.
 * @param {string} root Tunnel ROOT (git worktree).
 * @returns {Promise<string|null>}
 */
function gitHead(root) {
  return new Promise((resolve) => {
    execFile("git", ["-C", root, "rev-parse", "HEAD"], { timeout: 5000 }, (err, stdout) => {
      if (err) return resolve(null);
      const sha = String(stdout || "").trim();
      resolve(/^[0-9a-f]{40}$/.test(sha) ? sha : null);
    });
  });
}

/**
 * Build the single Runtime.evaluate probe used for readiness polling.
 * Checks document.readyState, an optional selector, and an optional
 * caller-supplied JS expression -- each guarded so a throwing page never
 * breaks the poll loop.
 * @param {object} [opts={}]
 * @param {string} [opts.waitForSelector]
 * @param {string} [opts.readyExpression]
 * @returns {string} JS expression returning {readyState, href, selector, custom}.
 */
function buildReadinessProbe({ waitForSelector, readyExpression } = {}) {
  const sel = waitForSelector
    ? `try{out.selector=!!document.querySelector(${JSON.stringify(String(waitForSelector))});}catch(e){out.selector=false;}`
    : "out.selector=true;";
  const custom = readyExpression
    ? `try{out.custom=!!(${String(readyExpression)});}catch(e){out.custom=false;}`
    : "out.custom=true;";
  return `(()=>{const out={readyState:document.readyState,href:location.href};${sel}${custom}return out;})()`;
}

/**
 * Poll the page until it is ready (readyState complete + selector +
 * custom expression) or the deadline passes. Throws on timeout.
 * @param {object} d Resolved deps ({cdp, sleep}).
 * @param {object} opts {timeoutMs, waitMs, waitForSelector, readyExpression}
 * @returns {Promise<{readyState:string,readyMs:number,selector:boolean,custom:boolean}>}
 */
async function waitForReadiness(d, { timeoutMs, waitMs, waitForSelector, readyExpression }) {
  const startedAt = Date.now();
  const deadline = startedAt + timeoutMs;
  const probe = buildReadinessProbe({ waitForSelector, readyExpression });
  let last = null;
  for (;;) {
    const res = await d.cdp.cdpCall(
      "Runtime.evaluate",
      { expression: probe, returnByValue: true },
      8000
    );
    const v = res && res.result && res.result.value;
    last = v;
    if (v && v.readyState === "complete" && v.selector !== false && v.custom !== false) break;
    if (Date.now() >= deadline) {
      const err = new Error("screenshot_readiness_timeout");
      err.lastProbe = last;
      throw err;
    }
    await d.sleep(250);
  }
  const settleMs = Math.max(0, Math.min(Number(waitMs) || 0, 10000));
  if (settleMs) await d.sleep(settleMs);
  return {
    readyState: "complete",
    readyMs: Date.now() - startedAt,
    selector: !!(last && last.selector),
    custom: !!(last && last.custom),
  };
}

/**
 * Map a thrown pipeline error to a stable, fail-closed error code.
 * @param {Error} error
 * @returns {string}
 */
function classifyError(error) {
  const msg = String((error && error.message) || error || "");
  if (msg.includes("screenshot_readiness_timeout")) return "screenshot_readiness_timeout";
  if (msg === "empty_screenshot_bytes" || msg === "screenshot_not_png") return "screenshot_pipeline_bad_capture";
  if (msg === "fresh_target_missing_id") return "screenshot_pipeline_target_failed";
  return "screenshot_pipeline_failed";
}

/**
 * Run the full screenshot pipeline.
 *
 * @param {object} [payload={}]
 * @param {string} payload.url REQUIRED: exact URL to navigate to.
 * @param {object} [payload.viewport] {width,height,deviceScaleFactor,mobile}.
 * @param {boolean} [payload.fullPage] captureBeyondViewport.
 * @param {number} [payload.timeoutMs] overall CDP timeout (default 60000).
 * @param {number} [payload.navTimeoutMs] navigation timeout (default 45000).
 * @param {number} [payload.readyTimeoutMs] readiness timeout (default 30000).
 * @param {number} [payload.waitMs] extra settle delay after ready (max 10000).
 * @param {string} [payload.waitForSelector] CSS selector that must exist.
 * @param {string} [payload.readyExpression] JS expression that must be truthy.
 * @param {string} [payload.commitSha] override for provenance.
 * @param {number} [payload.port] chrome remote-debugging port.
 * @param {boolean} [payload.closeTarget] default true: close the fresh target.
 * @param {boolean} [payload.inline] default true: include the PNG dataUrl in
 *   the result. Pass false for the chunked transfer path (the PNG is then
 *   pulled via the `transfer` descriptor instead of riding the result).
 * @param {string} [payload.previewAuthHeader] optional "Bearer ..." header
 *   injected via Network.setExtraHTTPHeaders before navigation (preview-link
 *   flow). Never persisted to evidence or logs.
 * @param {object} [deps={}] Injectable deps for tests: {cdp, extrasReady, fsRoot, gitHead, sleep, now}.
 * @returns {Promise<object>} ok:true with dataUrl/sha256/evidence/requiresVisualReview,
 *   or ok:false with a fail-closed error code.
 */
async function runScreenshotPipeline(payload = {}, deps = {}) {
  const action = "chromeScreenshotPipeline";
  const d = {
    cdp: deps.cdp || cdp,
    extrasReady: deps.extrasReady || extras.ready,
    fsRoot: deps.fsRoot || ROOT,
    gitHead: deps.gitHead || gitHead,
    sleep: deps.sleep || sleep,
    now: deps.now || (() => new Date().toISOString()),
  };

  const url = String(payload.url || "").trim();
  if (!url) {
    return { ok: false, action, error: "screenshot_pipeline_requires_url", note: "payload.url is required; refusing to capture an unspecified page" };
  }
  let parsed;
  try {
    parsed = new URL(url);
  } catch (e) {
    return { ok: false, action, error: "screenshot_pipeline_invalid_url", detail: String((e && e.message) || e) };
  }
  if (!/^https?:$/.test(parsed.protocol)) {
    return { ok: false, action, error: "screenshot_pipeline_invalid_url", detail: "only http(s) URLs are allowed" };
  }

  const viewport = normalizeViewport(payload.viewport);
  const fullPage = payload.fullPage === true;
  const port = Number(payload.port) || 9222;
  const timeoutMs = clampTimeout(payload.timeoutMs, 60000);
  const navTimeoutMs = clampTimeout(payload.navTimeoutMs || payload.timeoutMs, 45000);
  const readyTimeoutMs = clampTimeout(payload.readyTimeoutMs || payload.timeoutMs, 30000);

  try {
    await d.extrasReady({ ...payload, port });
  } catch (error) {
    return { ok: false, action, error: "screenshot_pipeline_chrome_unavailable", detail: String((error && error.message) || error), retryable: true };
  }

  let targetId = null;
  try {
    // Fresh target: never reuse whatever page happens to be open.
    const page = await d.cdp.newPage(port, "about:blank");
    targetId = page && page.id;
    if (!targetId) throw new Error("fresh_target_missing_id");
    await d.cdp.ensurePage(port, {
      chromeTargetId: targetId,
      forceReconnect: true,
      timeoutMs: Math.min(timeoutMs, 15000),
    });
    // Optional bearer-token header (preview-link flow). The token itself is
    // never persisted: it travels only in this CDP call, never in evidence.
    if (payload.previewAuthHeader) {
      await d.cdp.cdpCall(
        "Network.setExtraHTTPHeaders",
        { headers: { Authorization: String(payload.previewAuthHeader) } },
        Math.min(timeoutMs, 10000)
      );
    }
    // Exact viewport BEFORE navigation.
    await d.cdp.cdpCall(
      "Emulation.setDeviceMetricsOverride",
      { width: viewport.width, height: viewport.height, deviceScaleFactor: viewport.deviceScaleFactor, mobile: viewport.mobile },
      Math.min(timeoutMs, 10000)
    );
    // Navigate to the exact URL on OUR target.
    await d.cdp.navigateAndWait(url, navTimeoutMs, port, { chromeTargetId: targetId });
    // Readiness: readyState complete + optional selector/expression.
    const readiness = await waitForReadiness(d, {
      timeoutMs: readyTimeoutMs,
      waitMs: payload.waitMs,
      waitForSelector: payload.waitForSelector,
      readyExpression: payload.readyExpression,
    });
    // Capture a real PNG.
    const shot = await d.cdp.cdpCall(
      "Page.captureScreenshot",
      { format: "png", fromSurface: true, captureBeyondViewport: fullPage },
      timeoutMs
    );
    const pngBytes = Buffer.from((shot && shot.data) || "", "base64");
    if (!pngBytes.length) throw new Error("empty_screenshot_bytes");
    if (!pngBytes.subarray(0, 8).equals(PNG_MAGIC)) throw new Error("screenshot_not_png");
    const sha256 = sha256hex(pngBytes);

    // Deterministic evidence path: content-addressed, same pixels -> same path.
    const dir = path.join(d.fsRoot, EVIDENCE_SUBDIR);
    await fsp.mkdir(dir, { recursive: true });
    const pngPath = path.join(dir, sha256 + ".png");
    const sidecarPath = path.join(dir, sha256 + ".json");
    await fsp.writeFile(pngPath, pngBytes);
    const finalUrl = typeof d.cdp.currentHref === "function"
      ? await d.cdp.currentHref().catch(() => url)
      : url;
    const evidence = {
      action,
      sha256,
      url,
      finalUrl,
      viewport,
      format: "png",
      bytes: pngBytes.length,
      fullPage,
      capturedAt: d.now(),
      commitSha: payload.commitSha || process.env.AWTSMOOS_COMMIT_SHA || await d.gitHead(d.fsRoot).catch(() => null) || null,
      targetId,
      port,
      readiness,
      pngPath,
      sidecarPath,
    };
    await fsp.writeFile(sidecarPath, JSON.stringify(evidence, null, 2) + "\n");

    // Transfer descriptor: everything the assistant needs to pull this PNG
    // through the chunked, hash-verified download path. sourceProof is the
    // existing transfer primitive (streaming whole-file SHA-256, no full
    // memory load). Informational only: capture never fails for it, and a
    // descriptor is only advertised when the on-disk proof matches the
    // captured bytes exactly.
    let transfer = null;
    try {
      const Read = require("../fs/fileTransferRead.js");
      // Build the reader config explicitly: fileTransferRead needs
      // config.root (project root for safePath) and config.tools.fsRead.
      // loadConfig()'s shape is not guaranteed here, so derive from d.fsRoot.
      const readConfig = { root: d.fsRoot, tools: { fsRead: true } };
      const relPng = path.relative(d.fsRoot, pngPath);
      const proof = await Read.sourceProof(readConfig, { path: relPng });
      if (proof && String(proof.sha256).toLowerCase() === sha256 && Number(proof.totalBytes) === pngBytes.length) {
        transfer = { path: relPng, sha256: proof.sha256, totalBytes: proof.totalBytes, chunkBytes: 65536 };
      }
    } catch (e) { transfer = null; }
    if (transfer) evidence.transfer = transfer;

    // inline:false skips the dataUrl for the bandwidth-sane chunked path;
    // the PNG is then pulled via the transfer descriptor instead.
    const includeDataUrl = payload.inline !== false;
    return {
      ok: true,
      action,
      dataUrl: includeDataUrl ? "data:image/png;base64," + pngBytes.toString("base64") : undefined,
      inline: includeDataUrl,
      sha256,
      bytes: pngBytes.length,
      evidence,
      transfer,
      requiresVisualReview: true,
      visualReviewNote: "A model or human MUST visually inspect this image before any verified/fixed claim.",
    };
  } catch (error) {
    return {
      ok: false,
      action,
      error: classifyError(error),
      detail: String((error && error.message) || error),
      retryable: true,
      evidence: null,
    };
  } finally {
    if (targetId && payload.closeTarget !== false) {
      try { await d.cdp.closePage(port, targetId); } catch (e) { /* best effort */ }
    }
  }
}

/**
 * Record a signed visual-review receipt for a captured SHA-256. Fails
 * closed when no evidence exists for the sha (refuses to certify pixels
 * that were never captured by this pipeline).
 *
 * @param {object} [input={}] {sha256, verdict:"pass"|"fail"|"needs-work", reviewer, note}
 * @param {object} [deps={}] {fsRoot, now}
 * @returns {Promise<object>} {ok:true, receiptPath, receipt} or fail-closed {ok:false, error}.
 */
async function recordScreenshotReview(input = {}, deps = {}) {
  const action = "chromeScreenshotReviewRecord";
  const sha256 = String(input.sha256 || "").toLowerCase();
  if (!SHA256_RE.test(sha256)) {
    return { ok: false, action, error: "screenshot_review_invalid_sha256" };
  }
  if (!REVIEW_VERDICTS.includes(input.verdict)) {
    return { ok: false, action, error: "screenshot_review_invalid_verdict", detail: "verdict must be one of " + REVIEW_VERDICTS.join(",") };
  }
  const fsRoot = deps.fsRoot || ROOT;
  const now = deps.now || (() => new Date().toISOString());
  const dir = path.join(fsRoot, EVIDENCE_SUBDIR);
  let evidence = null;
  try {
    evidence = JSON.parse(await fsp.readFile(path.join(dir, sha256 + ".json"), "utf8"));
  } catch (e) {
    evidence = null;
  }
  if (!evidence || evidence.sha256 !== sha256) {
    return { ok: false, action, error: "screenshot_review_unknown_evidence", note: "no pipeline evidence for this sha256; refusing to certify uncaptured pixels" };
  }
  const receipt = {
    action,
    sha256,
    verdict: input.verdict,
    reviewer: String(input.reviewer || "unknown"),
    note: String(input.note || ""),
    reviewedAt: now(),
    evidence: {
      capturedAt: evidence.capturedAt,
      commitSha: evidence.commitSha,
      url: evidence.url,
      finalUrl: evidence.finalUrl,
      viewport: evidence.viewport,
      bytes: evidence.bytes,
    },
  };
  await fsp.mkdir(dir, { recursive: true });
  const receiptPath = path.join(dir, sha256 + ".review.json");
  await fsp.writeFile(receiptPath, JSON.stringify(receipt, null, 2) + "\n");
  return { ok: true, action, receiptPath, receipt };
}

/**
 * Read a previously recorded visual-review receipt.
 * @param {string} sha256
 * @param {object} [deps={}] {fsRoot}
 * @returns {Promise<object>} {ok:true, receiptPath, receipt} or {ok:false, error}.
 */
async function readScreenshotReview(sha256, deps = {}) {
  const action = "chromeScreenshotReviewRead";
  const id = String(sha256 || "").toLowerCase();
  if (!SHA256_RE.test(id)) {
    return { ok: false, action, error: "screenshot_review_invalid_sha256" };
  }
  const receiptPath = path.join(deps.fsRoot || ROOT, EVIDENCE_SUBDIR, id + ".review.json");
  try {
    const receipt = JSON.parse(await fsp.readFile(receiptPath, "utf8"));
    return { ok: true, action, receiptPath, receipt };
  } catch (e) {
    return { ok: false, action, error: "screenshot_review_receipt_missing", sha256: id };
  }
}

// ---------------------------------------------------------------------------
// Preview-link verification path (Worker E integration).
//
// Primary path for localhost serves: confirm the serve is up on the Mac
// port -> previewLinkCreate(port) -> probe whether the live relay forwards
// /api/tunnel/preview -> fresh Chrome target loads the preview URL with the
// bearer token -> capture -> SHA-256 -> deterministic evidence -> inline
// dataUrl -> visual-review receipt helpers.
//
// The bearer token NEVER touches evidence, logs, or results, and the link
// is revoked afterwards unless payload.preview.keepAlive === true.
// ---------------------------------------------------------------------------

/**
 * Best-effort require of Worker E's preview-links module. Returns null when
 * the worker-e/preview-links branch has not been merged in yet; the preview
 * path then fails closed instead of crashing.
 * @returns {object|null}
 */
function safeRequirePreviewLinks() {
  try {
    return require("../preview/previewLinks.js");
  } catch (e) {
    return null;
  }
}

/**
 * TCP probe: is anything listening on host:port?
 * @param {string} host
 * @param {number} port
 * @param {number} timeoutMs
 * @returns {Promise<boolean>}
 */
function tcpProbe(host, port, timeoutMs) {
  const net = require("net");
  return new Promise((resolve) => {
    const s = net.connect({ host, port, timeout: timeoutMs });
    s.on("connect", () => { s.destroy(); resolve(true); });
    s.on("timeout", () => { s.destroy(); resolve(false); });
    s.on("error", () => { s.destroy(); resolve(false); });
  });
}

/**
 * Minimal HTTPS GET probe: status code + first bytes of the body.
 * @param {string} url
 * @param {object} headers
 * @param {number} timeoutMs
 * @returns {Promise<{statusCode:number,body:string,error?:string}>}
 */
function httpsProbe(url, headers, timeoutMs) {
  const https = require("https");
  return new Promise((resolve) => {
    const req = https.get(url, { headers, timeout: timeoutMs }, (res) => {
      let n = 0;
      const chunks = [];
      res.on("data", (c) => { n += c.length; if (n <= 8192) chunks.push(c); });
      res.on("end", () => resolve({ statusCode: res.statusCode, body: Buffer.concat(chunks).toString("utf8") }));
    });
    req.on("timeout", () => { req.destroy(); resolve({ statusCode: 0, body: "", error: "timeout" }); });
    req.on("error", (e) => resolve({ statusCode: 0, body: "", error: String((e && e.message) || e) }));
  });
}

/**
 * The relay's signature when the preview route is not implemented: its
 * generic 404 INVALID_ROUTE envelope (measured live on awtsmoos.com).
 * @param {object} probe {statusCode, body}
 * @returns {boolean}
 */
function isRelayMissingProbe(probe) {
  return !!probe && probe.statusCode === 404 && /INVALID_ROUTE/.test(probe.body || "");
}

/**
 * Normalize the preview sub-path (always leading slash).
 * @param {*} p
 * @returns {string}
 */
function normalizePreviewPath(p) {
  const s = String(p || "/");
  return s.startsWith("/") ? s : "/" + s;
}

/**
 * Preview-link verification flow. See the section header above.
 *
 * @param {object} [payload={}] runScreenshotPipeline fields plus:
 * @param {object} [payload.preview] {port (REQUIRED), path="/", label,
 *   ttlMinutes, stateRoot, keepAlive}. Also accepts flat
 *   payload.previewPort / payload.previewPath.
 * @param {object} [deps={}] runScreenshotPipeline deps plus
 *   {previewLinks, tcpProbe, httpsProbe} for tests. Pass
 *   `previewLinks:false` to simulate the unmerged branch.
 * @returns {Promise<object>} Pipeline result (possibly the direct-localhost
 *   fallback, honestly labeled), or a fail-closed error.
 */
async function runPreviewScreenshotPipeline(payload = {}, deps = {}) {
  const action = "chromeScreenshotPipeline";
  const preview = payload.preview || {};
  const port = Number(preview.port || payload.previewPort);
  const previewPath = normalizePreviewPath(preview.path || payload.previewPath || "/");
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    return { ok:false, action, error:"preview_port_required", note:"payload.preview.port (1-65535) is required for the preview path; no guessing at localhost, no hardcoded ports" };
  }
  const PreviewLinks = ("previewLinks" in deps) ? deps.previewLinks : safeRequirePreviewLinks();
  if (!PreviewLinks) {
    return { ok:false, action, error:"preview_links_unavailable", note:"worker-e/preview-links is not merged in; use direct-URL capture (payload.url) instead" };
  }
  const tcpProbeFn = deps.tcpProbe || tcpProbe;
  const httpsProbeFn = deps.httpsProbe || httpsProbe;

  // 1. Confirm the local serve is actually up on the Mac.
  let listening = false;
  try { listening = await tcpProbeFn("127.0.0.1", port, 3000); } catch (e) { listening = false; }
  if (!listening) {
    return { ok:false, action, error:"preview_upstream_unreachable", detail:"nothing listening on 127.0.0.1:" + port };
  }

  // 2. Mint the short-lived bearer link for exactly this port.
  let created;
  try {
    created = PreviewLinks.previewLinkCreate({
      port,
      label: preview.label,
      ttlMinutes: preview.ttlMinutes,
      stateRoot: preview.stateRoot,
    });
  } catch (e) {
    return { ok:false, action, error:"preview_link_create_failed", detail:String((e && e.message) || e) };
  }
  if (!created || created.ok !== true || !created.token || !created.tokenId || !created.url) {
    return { ok:false, action, error:"preview_link_create_failed", detail:(created && created.error) || "mint rejected" };
  }
  const token = created.token;
  const tokenId = created.tokenId;
  const previewUrl = String(created.url).replace(/\/*$/, "") + previewPath;
  const revoke = () => {
    if (preview.keepAlive === true) return;
    try { PreviewLinks.previewLinkRevoke({ tokenId, stateRoot: preview.stateRoot }); } catch (e) { /* best effort */ }
  };

  try {
    // 3. Relay liveness probe: does awtsmoos.com forward /api/tunnel/preview TODAY?
    let probe;
    try {
      probe = await httpsProbeFn(previewUrl, { Authorization: "Bearer " + token }, 10000);
    } catch (e) {
      probe = { statusCode: 0, body: "", error: String((e && e.message) || e) };
    }
    if (isRelayMissingProbe(probe)) {
      // Fallback: direct localhost capture, honestly labeled. The relay
      // simply has no /api/tunnel/preview route yet (relay deploy needed).
      const direct = await runScreenshotPipeline({ ...payload, url:"http://127.0.0.1:" + port + previewPath }, deps);
      direct.previewRelay = "unavailable-fallback-direct";
      direct.previewNote = "relay has no /api/tunnel/preview route (404 INVALID_ROUTE); captured via direct localhost instead";
      if (direct.evidence) direct.evidence.preview = { tokenId, port, path:previewPath, relay:"unavailable", expiresAt:created.expiresAt || null };
      return direct;
    }
    const probeOk = probe && probe.statusCode >= 200 && probe.statusCode < 400;
    if (!probeOk) {
      return { ok:false, action, error:"preview_probe_failed", detail:"preview URL probe returned " + (probe && probe.statusCode) + (probe && probe.error ? " (" + probe.error + ")" : ""), retryable:true };
    }

    // 4. Capture through the preview URL with the bearer token injected as
    //    an Authorization header. The token never touches evidence or logs.
    const res = await runScreenshotPipeline({ ...payload, url:previewUrl, previewAuthHeader:"Bearer " + token }, deps);
    if (res.evidence) res.evidence.preview = { tokenId, port, path:previewPath, relay:"live", expiresAt:created.expiresAt || null };
    return res;
  } finally {
    revoke();
  }
}

module.exports = {
  runScreenshotPipeline,
  runPreviewScreenshotPipeline,
  recordScreenshotReview,
  readScreenshotReview,
  // Exported for fixture-driven tests (no live browser needed):
  normalizeViewport,
  buildReadinessProbe,
  isRelayMissingProbe,
  normalizePreviewPath,
  EVIDENCE_SUBDIR,
};
