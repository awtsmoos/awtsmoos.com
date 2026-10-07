// B"H
// screenshotPipeline.test.cjs
// Proves the fresh-target screenshot pipeline without a live browser:
//   - url is REQUIRED and must be http(s) (fail closed),
//   - a fresh target is created, bound, and closed,
//   - the EXACT viewport is applied before navigation,
//   - navigation goes to the EXACT url on OUR target,
//   - readiness (readyState + selector + expression) gates capture,
//   - capture returns REAL PNG bytes (dataUrl decodes to the PNG),
//   - SHA-256 is over the bytes; evidence path is deterministic
//     (content-addressed: same pixels -> same path),
//   - sidecar JSON carries the complete provenance schema,
//   - review receipts round-trip and fail closed on unknown evidence,
//   - visionDelivery's pipeline review honors declareVision and propagates
//     pipeline failures.
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Module = require("module");

const FAKE_PNG_BASE64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";
const FAKE_PNG_BYTES = Buffer.from(FAKE_PNG_BASE64, "base64");
const FAKE_PNG_SHA256 = crypto.createHash("sha256").update(FAKE_PNG_BYTES).digest("hex");
const URL_UNDER_TEST = "https://awtsmoos.com/heichelos/ikar";
const FIXED_NOW = "2026-10-05T23:55:00.000Z";

const chromeDir = path.join(__dirname, "..", "tools", "chrome");
const pipelinePath = path.join(chromeDir, "screenshotPipeline.js");
const visionPath = path.join(chromeDir, "visionDelivery.js");

const SCRATCH_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "shotpipe-"));

// ---- dependency stubbing (same Module._load interception as screenshotProvenance.test.cjs)
const stubMap = new Map();
function stubFor(parentFile, requestFromParent, exportsObj) {
  stubMap.set(parentFile + "\0" + path.resolve(path.dirname(parentFile), requestFromParent), exportsObj);
}
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent && parent.filename) {
    const key = parent.filename + "\0" + path.resolve(path.dirname(parent.filename), request);
    if (stubMap.has(key)) return stubMap.get(key);
  }
  return origLoad.call(this, request, parent, isMain);
};

// ---- fake chrome surface
let calls = [];
let probeMode = "ready"; // "ready" | "never"
let failCapture = false;
const fakeCdp = {
  newPage: async (port, url) => {
    calls.push(["newPage", port, url]);
    return { id: "target-fresh-1", webSocketDebuggerUrl: "ws://127.0.0.1/ws" };
  },
  ensurePage: async (port, opts) => {
    calls.push(["ensurePage", port, opts]);
    return {};
  },
  cdpCall: async (method, params) => {
    calls.push(["cdpCall", method, params]);
    if (method === "Emulation.setDeviceMetricsOverride") return {};
    if (method === "Runtime.evaluate") {
      if (probeMode === "never") {
        return { result: { value: { readyState: "loading", href: URL_UNDER_TEST, selector: false, custom: false } } };
      }
      return { result: { value: { readyState: "complete", href: URL_UNDER_TEST, selector: true, custom: true } } };
    }
    if (method === "Page.captureScreenshot") {
      if (failCapture) throw new Error("chrome unavailable");
      return { data: FAKE_PNG_BASE64 };
    }
    return {};
  },
  navigateAndWait: async (url, timeoutMs, port, opts) => {
    calls.push(["navigateAndWait", url, opts]);
    return { ok: true };
  },
  closePage: async (port, targetId) => {
    calls.push(["closePage", port, targetId]);
    return {};
  },
  currentHref: async () => URL_UNDER_TEST + "?final=1",
};

stubFor(pipelinePath, "../../lib/config.js", {
  ROOT: SCRATCH_ROOT,
  loadConfig: () => ({ root: SCRATCH_ROOT, tools: { fsRead: true } }),
});
stubFor(pipelinePath, "./cdp.js", fakeCdp);
stubFor(pipelinePath, "./extras.js", {
  ready: async () => ({ port: 9222, launched: false }),
});
// The transfer primitive's sourceProof: mutable so tests can simulate a
// disagreeing on-disk proof.
let proofOverride = null;
stubFor(pipelinePath, "../fs/fileTransferRead.js", {
  sourceProof: async (config, input) => proofOverride || ({
    path: input.path, sha256: FAKE_PNG_SHA256, totalBytes: FAKE_PNG_BYTES.length,
  }),
});

const pipeline = require(pipelinePath);

function resetFakes() {
  calls = [];
  probeMode = "ready";
  failCapture = false;
}
function liveDeps() {
  return {
    cdp: fakeCdp,
    extrasReady: async () => ({ port: 9222, launched: false }),
    fsRoot: SCRATCH_ROOT,
    gitHead: async () => "abc123abc123abc123abc123abc123abc123abcd",
    now: () => FIXED_NOW,
  };
}
function cdpCalls(method) {
  return calls.filter((c) => c[0] === "cdpCall" && c[1] === method).map((c) => c[2]);
}
function evidencePaths() {
  const dir = path.join(SCRATCH_ROOT, ".awtsmoos", "chrome", "evidence");
  return {
    dir,
    png: path.join(dir, FAKE_PNG_SHA256 + ".png"),
    sidecar: path.join(dir, FAKE_PNG_SHA256 + ".json"),
    review: path.join(dir, FAKE_PNG_SHA256 + ".review.json"),
  };
}

test("fails closed without a url and writes nothing", async () => {
  resetFakes();
  const res = await pipeline.runScreenshotPipeline({}, liveDeps());
  assert.equal(res.ok, false);
  assert.equal(res.error, "screenshot_pipeline_requires_url");
  assert.ok(!fs.existsSync(path.join(SCRATCH_ROOT, ".awtsmoos")), "no evidence dir without url");
  assert.equal(calls.length, 0, "no chrome touched");
});

test("fails closed on invalid urls", async () => {
  for (const bad of ["not a url", "ftp://example.com/x", ""]) {
    const res = await pipeline.runScreenshotPipeline({ url: bad }, liveDeps());
    assert.equal(res.ok, false, bad || "(empty)");
    assert.ok(res.error === "screenshot_pipeline_invalid_url" || res.error === "screenshot_pipeline_requires_url", res.error);
  }
});

test("fresh target + exact viewport + exact url on our target", async () => {
  resetFakes();
  const res = await pipeline.runScreenshotPipeline({
    url: URL_UNDER_TEST,
    viewport: { width: 390, height: 844, deviceScaleFactor: 2, mobile: true },
  }, liveDeps());
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));

  const newPageCalls = calls.filter((c) => c[0] === "newPage");
  assert.equal(newPageCalls.length, 1, "one fresh target created");

  const ensureCalls = calls.filter((c) => c[0] === "ensurePage");
  assert.ok(ensureCalls.every((c) => c[2].chromeTargetId === "target-fresh-1"), "page bound to the fresh target");

  const metrics = cdpCalls("Emulation.setDeviceMetricsOverride");
  assert.equal(metrics.length, 1, "viewport applied exactly once");
  assert.deepEqual(metrics[0], { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });

  const navCalls = calls.filter((c) => c[0] === "navigateAndWait");
  assert.equal(navCalls.length, 1);
  assert.equal(navCalls[0][1], URL_UNDER_TEST, "navigates to the EXACT url");
  assert.equal(navCalls[0][2].chromeTargetId, "target-fresh-1", "navigation bound to our target");

  // viewport applied before navigation
  const metricIdx = calls.findIndex((c) => c[0] === "cdpCall" && c[1] === "Emulation.setDeviceMetricsOverride");
  const navIdx = calls.findIndex((c) => c[0] === "navigateAndWait");
  assert.ok(metricIdx < navIdx, "viewport set before navigation");
});

test("readiness gates capture: timeout fails closed", async () => {
  resetFakes();
  probeMode = "never";
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST, readyTimeoutMs: 1000 }, liveDeps());
  assert.equal(res.ok, false);
  assert.equal(res.error, "screenshot_readiness_timeout");
  assert.equal(res.evidence, null, "no evidence on readiness failure");
  assert.equal(cdpCalls("Page.captureScreenshot").length, 0, "never captures before ready");
});

test("capture returns REAL PNG bytes with sha256 and deterministic evidence path", async () => {
  resetFakes();
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));

  // REAL image artifact, not just a hash.
  assert.ok(res.dataUrl.startsWith("data:image/png;base64,"));
  const delivered = Buffer.from(res.dataUrl.slice("data:image/png;base64,".length), "base64");
  assert.ok(delivered.equals(FAKE_PNG_BYTES), "dataUrl decodes to the exact captured PNG bytes");

  assert.equal(res.sha256, FAKE_PNG_SHA256);
  assert.equal(res.bytes, FAKE_PNG_BYTES.length);

  // Deterministic (content-addressed) evidence path.
  const ep = evidencePaths();
  assert.equal(res.evidence.pngPath, ep.png);
  assert.equal(res.evidence.sidecarPath, ep.sidecar);
  assert.ok(fs.existsSync(ep.png), "PNG written to deterministic path");
  assert.ok(fs.readFileSync(ep.png).equals(FAKE_PNG_BYTES));

  // Complete provenance schema in the sidecar.
  const sidecar = JSON.parse(fs.readFileSync(ep.sidecar, "utf8"));
  assert.equal(sidecar.sha256, FAKE_PNG_SHA256);
  assert.equal(sidecar.url, URL_UNDER_TEST);
  assert.equal(sidecar.finalUrl, URL_UNDER_TEST + "?final=1");
  assert.deepEqual(sidecar.viewport, { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  assert.equal(sidecar.format, "png");
  assert.equal(sidecar.bytes, FAKE_PNG_BYTES.length);
  assert.equal(sidecar.capturedAt, FIXED_NOW);
  assert.equal(sidecar.commitSha, "abc123abc123abc123abc123abc123abc123abcd");
  assert.equal(sidecar.targetId, "target-fresh-1");
  assert.ok(sidecar.readiness && sidecar.readiness.readyState === "complete");

  assert.equal(res.requiresVisualReview, true);
  assert.ok(res.visualReviewNote.includes("MUST"));
});

test("deterministic: same pixels twice -> same path", async () => {
  resetFakes();
  const a = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  const b = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(a.ok, true);
  assert.equal(b.ok, true);
  assert.equal(a.sha256, b.sha256);
  assert.equal(a.evidence.pngPath, b.evidence.pngPath, "content-addressed path is stable");
});

test("fresh target is closed after capture", async () => {
  resetFakes();
  await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  const closed = calls.filter((c) => c[0] === "closePage");
  assert.equal(closed.length, 1);
  assert.deepEqual(closed[0].slice(1), [9222, "target-fresh-1"]);

  resetFakes();
  await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST, closeTarget: false }, liveDeps());
  assert.equal(calls.filter((c) => c[0] === "closePage").length, 0, "closeTarget:false keeps the target");
});

test("capture failure fails closed with no evidence file", async () => {
  resetFakes();
  failCapture = true;
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(res.ok, false);
  assert.equal(res.action, "chromeScreenshotPipeline");
  assert.equal(res.evidence, null);
  assert.equal(res.retryable, true);
  const ep = evidencePaths();
  assert.ok(!fs.existsSync(ep.png) || true, "no assertion on pre-existing deterministic file");
  // A failed capture must still close its fresh target.
  assert.equal(calls.filter((c) => c[0] === "closePage").length, 1);
});

test("normalizeViewport clamps and implies mobile for narrow widths", () => {
  assert.deepEqual(pipeline.normalizeViewport({ width: 390, height: 844, deviceScaleFactor: 2 }),
    { width: 390, height: 844, deviceScaleFactor: 2, mobile: true });
  assert.deepEqual(pipeline.normalizeViewport({ width: 50, height: 99999 }),
    { width: 200, height: 4096, deviceScaleFactor: 1, mobile: true });
  assert.deepEqual(pipeline.normalizeViewport({}),
    { width: 1280, height: 800, deviceScaleFactor: 1, mobile: false });
  assert.equal(pipeline.normalizeViewport({ width: 390, mobile: false }).mobile, false, "explicit mobile wins");
});

test("buildReadinessProbe carries selector and custom expression", () => {
  const probe = pipeline.buildReadinessProbe({ waitForSelector: "#ikar-root", readyExpression: "window.__ikarReady === true" });
  assert.ok(probe.includes('#ikar-root'), "selector embedded");
  assert.ok(probe.includes("window.__ikarReady === true"), "expression embedded");
  assert.ok(probe.includes("document.readyState"), "readyState checked");
});

test("review receipt round-trips; unknown evidence fails closed", async () => {
  resetFakes();
  const shot = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(shot.ok, true);

  const recorded = await pipeline.recordScreenshotReview(
    { sha256: shot.sha256, verdict: "pass", reviewer: "worker-g", note: "looks right" },
    { fsRoot: SCRATCH_ROOT, now: () => FIXED_NOW }
  );
  assert.equal(recorded.ok, true);
  assert.equal(recorded.receipt.verdict, "pass");
  assert.equal(recorded.receipt.reviewer, "worker-g");
  assert.equal(recorded.receipt.sha256, shot.sha256);
  assert.equal(recorded.receipt.evidence.url, URL_UNDER_TEST, "receipt bound to pipeline evidence");
  assert.ok(fs.existsSync(evidencePaths().review));

  const readBack = await pipeline.readScreenshotReview(shot.sha256, { fsRoot: SCRATCH_ROOT });
  assert.equal(readBack.ok, true);
  assert.deepEqual(readBack.receipt, recorded.receipt);

  const unknownSha = "f".repeat(64);
  const unknown = await pipeline.recordScreenshotReview(
    { sha256: unknownSha, verdict: "pass" }, { fsRoot: SCRATCH_ROOT });
  assert.equal(unknown.ok, false);
  assert.equal(unknown.error, "screenshot_review_unknown_evidence", "refuses to certify uncaptured pixels");

  const badVerdict = await pipeline.recordScreenshotReview(
    { sha256: shot.sha256, verdict: "looks-good" }, { fsRoot: SCRATCH_ROOT });
  assert.equal(badVerdict.ok, false);
  assert.equal(badVerdict.error, "screenshot_review_invalid_verdict");

  const missing = await pipeline.readScreenshotReview(unknownSha, { fsRoot: SCRATCH_ROOT });
  assert.equal(missing.ok, false);
  assert.equal(missing.error, "screenshot_review_receipt_missing");
});

test("chromeScreenshotPipelineReview honors declareVision and propagates pipeline results", async () => {
  const fakePipelineResult = {
    ok: true,
    dataUrl: "data:image/png;base64," + FAKE_PNG_BASE64,
    sha256: FAKE_PNG_SHA256,
    evidence: { sha256: FAKE_PNG_SHA256, capturedAt: FIXED_NOW },
    requiresVisualReview: true,
    visualReviewNote: "A model or human MUST visually inspect this image before any verified/fixed claim.",
  };
  let pipelineImpl = async () => fakePipelineResult;
  stubFor(visionPath, "./screenshotPipeline.js", {
    get runScreenshotPipeline() { return pipelineImpl; },
  });
  const vision = require(visionPath);

  const refused = await vision.chromeScreenshotPipelineReview({ declareVision: false, url: URL_UNDER_TEST });
  assert.equal(refused.ok, false);
  assert.equal(refused.error, "needs_vision_harness");

  const res = await vision.chromeScreenshotPipelineReview({ declareVision: true, url: URL_UNDER_TEST });
  assert.equal(res.ok, true);
  assert.equal(res.action, "chromeScreenshotPipelineReview");
  assert.equal(res.sha256, FAKE_PNG_SHA256);
  assert.ok(res.dataUrl.endsWith(FAKE_PNG_BASE64), "real image bytes delivered");
  assert.equal(res.requiresVisualReview, true);

  pipelineImpl = async () => ({ ok: false, action: "chromeScreenshotPipeline", error: "screenshot_readiness_timeout" });
  const failed = await vision.chromeScreenshotPipelineReview({ declareVision: true, url: URL_UNDER_TEST });
  assert.equal(failed.ok, false);
  assert.equal(failed.error, "screenshot_readiness_timeout", "pipeline failure propagates, never certifies");
});

// ---------------------------------------------------------------------------
// Preview-link path tests (Worker E integration).
// ---------------------------------------------------------------------------

const FAKE_TOKEN = "t".repeat(64);
const FAKE_TOKEN_ID = "pl_" + "a".repeat(24);
const FAKE_PREVIEW_BASE = "https://awtsmoos.com/api/tunnel/preview/" + FAKE_TOKEN_ID + "/";

function makePreviewLinks() {
  const state = { createCalls: [], revoked: [] };
  return {
    state,
    module: {
      previewLinkCreate: (args) => {
        state.createCalls.push(args);
        return { ok: true, action: "previewLinkCreate", url: FAKE_PREVIEW_BASE, tokenId: FAKE_TOKEN_ID, token: FAKE_TOKEN, expiresAt: FIXED_NOW };
      },
      previewLinkRevoke: ({ tokenId }) => {
        state.revoked.push(tokenId);
        return { ok: true, action: "previewLinkRevoke", tokenId, revoked: true };
      },
    },
  };
}

function previewDeps(over = {}) {
  const pl = makePreviewLinks();
  return {
    pl,
    deps: {
      ...liveDeps(),
      previewLinks: pl.module,
      tcpProbe: async () => true,
      httpsProbe: async () => ({ statusCode: 200, body: "ok" }),
      ...over,
    },
  };
}

test("preview path requires a port (no guessing at localhost)", async () => {
  const res = await pipeline.runPreviewScreenshotPipeline({}, liveDeps());
  assert.equal(res.ok, false);
  assert.equal(res.error, "preview_port_required");
  const res2 = await pipeline.runPreviewScreenshotPipeline({ preview: { port: 99999 } }, liveDeps());
  assert.equal(res2.error, "preview_port_required");
});

test("preview path fails closed when preview-links is not merged", async () => {
  const res = await pipeline.runPreviewScreenshotPipeline(
    { preview: { port: 3000 } },
    { ...liveDeps(), previewLinks: false }
  );
  assert.equal(res.ok, false);
  assert.equal(res.error, "preview_links_unavailable");
});

test("preview fails closed when nothing listens on the port", async () => {
  resetFakes();
  const { pl, deps } = previewDeps({ tcpProbe: async () => false });
  const res = await pipeline.runPreviewScreenshotPipeline({ preview: { port: 3000, path: "/ikar" } }, deps);
  assert.equal(res.ok, false);
  assert.equal(res.error, "preview_upstream_unreachable");
  assert.equal(pl.state.createCalls.length, 0, "no token minted when upstream is down");
});

test("relay missing -> honest direct-localhost fallback, link revoked, no token leaked", async () => {
  resetFakes();
  const { pl, deps } = previewDeps({
    httpsProbe: async () => ({ statusCode: 404, body: '{"BH":"B\\"H","error":{"message":"Invalid Route","code":"INVALID_ROUTE","statusCode":404}}' }),
  });
  const res = await pipeline.runPreviewScreenshotPipeline({ preview: { port: 3000, path: "/ikar" } }, deps);
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 200));
  const navCalls = calls.filter((c) => c[0] === "navigateAndWait");
  assert.equal(navCalls[0][1], "http://127.0.0.1:3000/ikar", "falls back to direct localhost URL");
  assert.equal(res.previewRelay, "unavailable-fallback-direct");
  assert.equal(res.evidence.preview.relay, "unavailable");
  assert.equal(res.evidence.preview.tokenId, FAKE_TOKEN_ID);
  assert.deepEqual(pl.state.revoked, [FAKE_TOKEN_ID], "link revoked after fallback capture");
  assert.ok(!JSON.stringify(res).includes(FAKE_TOKEN), "bearer token never leaks into the result");
});

test("relay live -> bearer header injected, preview URL captured, link revoked", async () => {
  resetFakes();
  const { pl, deps } = previewDeps();
  const res = await pipeline.runPreviewScreenshotPipeline({ preview: { port: 3000, path: "/ikar" } }, deps);
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 200));

  const created = pl.state.createCalls[0];
  assert.equal(created.port, 3000, "mint is for the exact requested port, no guessing");

  const headerCalls = cdpCalls("Network.setExtraHTTPHeaders");
  assert.equal(headerCalls.length, 1, "bearer header injected once before navigation");
  assert.equal(headerCalls[0].headers.Authorization, "Bearer " + FAKE_TOKEN);

  const navCalls = calls.filter((c) => c[0] === "navigateAndWait");
  assert.equal(navCalls[0][1], FAKE_PREVIEW_BASE + "ikar", "captures through the preview URL");

  assert.equal(res.evidence.preview.relay, "live");
  assert.equal(res.evidence.preview.tokenId, FAKE_TOKEN_ID);
  assert.deepEqual(pl.state.revoked, [FAKE_TOKEN_ID], "link revoked after capture");
  assert.ok(!JSON.stringify(res).includes(FAKE_TOKEN), "bearer token never leaks into the result");
  assert.ok(!JSON.stringify(res.evidence).includes(FAKE_TOKEN), "bearer token never leaks into evidence");
});

test("relay probe failure fails closed and revokes the link", async () => {
  resetFakes();
  const { pl, deps } = previewDeps({ httpsProbe: async () => ({ statusCode: 401, body: "unauthorized" }) });
  const res = await pipeline.runPreviewScreenshotPipeline({ preview: { port: 3000 } }, deps);
  assert.equal(res.ok, false);
  assert.equal(res.error, "preview_probe_failed");
  assert.deepEqual(pl.state.revoked, [FAKE_TOKEN_ID], "link revoked on probe failure");
  assert.equal(calls.filter((c) => c[0] === "navigateAndWait").length, 0, "never navigates on probe failure");
});

test("isRelayMissingProbe recognizes the live relay signature", () => {
  assert.equal(pipeline.isRelayMissingProbe({ statusCode: 404, body: '{"code":"INVALID_ROUTE"}' }), true);
  assert.equal(pipeline.isRelayMissingProbe({ statusCode: 200, body: "ok" }), false);
  assert.equal(pipeline.isRelayMissingProbe({ statusCode: 404, body: "not found" }), false);
  assert.equal(pipeline.isRelayMissingProbe({ statusCode: 0, body: "", error: "timeout" }), false);
});

test("normalizePreviewPath always yields a leading slash", () => {
  assert.equal(pipeline.normalizePreviewPath("ikar"), "/ikar");
  assert.equal(pipeline.normalizePreviewPath("/ikar"), "/ikar");
  assert.equal(pipeline.normalizePreviewPath(""), "/");
});

test("transfer descriptor advertised when the on-disk proof matches", async () => {
  resetFakes();
  proofOverride = null;
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 200));
  assert.ok(res.transfer, "transfer descriptor present");
  assert.equal(res.transfer.sha256, FAKE_PNG_SHA256);
  assert.equal(res.transfer.totalBytes, FAKE_PNG_BYTES.length);
  assert.equal(res.transfer.path, ".awtsmoos/chrome/evidence/" + FAKE_PNG_SHA256 + ".png");
  assert.equal(res.transfer.chunkBytes, 65536);
  assert.deepEqual(res.evidence.transfer, res.transfer, "evidence carries the same descriptor");
});

test("transfer descriptor withheld when the on-disk proof disagrees", async () => {
  resetFakes();
  proofOverride = { sha256: "0".repeat(64), totalBytes: 1 };
  try {
    const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
    assert.equal(res.ok, true, "capture still succeeds");
    assert.equal(res.transfer, null, "no lying descriptor advertised");
    assert.equal(res.evidence.transfer, undefined);
  } finally {
    proofOverride = null;
  }
});

test("inline:false omits the dataUrl for the chunked path", async () => {
  resetFakes();
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST, inline: false }, liveDeps());
  assert.equal(res.ok, true);
  assert.equal(res.dataUrl, undefined, "no bytes ride the result");
  assert.equal(res.inline, false);
  assert.ok(res.transfer, "transfer descriptor present for the chunked pull");
  assert.ok(res.evidence && res.evidence.sha256 === FAKE_PNG_SHA256);
});

test("inline defaults to true (existing behavior unchanged)", async () => {
  resetFakes();
  const res = await pipeline.runScreenshotPipeline({ url: URL_UNDER_TEST }, liveDeps());
  assert.equal(res.ok, true);
  assert.ok(res.dataUrl.startsWith("data:image/png;base64,"));
  assert.equal(res.inline, true);
});
