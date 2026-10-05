// B"H
// screenshotProvenance.test.cjs
// Proves the hardened screenshot pipeline without a live browser:
//   - chromeScreenshot always writes a sidecar JSON next to the PNG with the
//     complete provenance schema,
//   - the result carries an evidence descriptor (backward compatible),
//   - chromeScreenshotReview fails closed when the caller cannot render images.
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

const chromeDir = path.join(__dirname, "..", "tools", "chrome");
const extrasPath = path.join(chromeDir, "extras.js");
const visionPath = path.join(chromeDir, "visionDelivery.js");

// One scratch tunnel ROOT for the whole file (extras.js binds ROOT at load).
const SCRATCH_ROOT = fs.mkdtempSync(path.join(os.tmpdir(), "shotprov-"));

// Dependency stubs are installed by intercepting Module._load for requires
// whose parent is extras.js. (Pre-populating require.cache does not work:
// Node resolves the filename before consulting the cache.)
const stubMap = new Map();
function stubDep(requestFromExtras, exportsObj) {
  stubMap.set(path.resolve(chromeDir, requestFromExtras), exportsObj);
}
const origLoad = Module._load;
Module._load = function (request, parent, isMain) {
  if (parent && parent.filename === extrasPath) {
    const resolved = path.resolve(path.dirname(parent.filename), request);
    if (stubMap.has(resolved)) return stubMap.get(resolved);
  }
  return origLoad.call(this, request, parent, isMain);
};

let failCapture = false;
let lastEvaluateExpression = null;

async function fakeCdpCall(method, params) {
  if (method === "Page.bringToFront") return {};
  if (method === "Page.captureScreenshot") {
    if (failCapture) throw new Error("chrome unavailable");
    return { data: FAKE_PNG_BASE64 };
  }
  if (method === "Runtime.evaluate") {
    lastEvaluateExpression = params && params.expression;
    return { result: { value: { url:"https://example.com/under-test", width:390, height:844, deviceScaleFactor:2 } } };
  }
  return {};
}

stubDep("../../lib/config.js", {
  ROOT: SCRATCH_ROOT,
  loadConfig: () => ({ chrome:{ enabled:true, port:9222 }, tools:{ chrome:true } })
});
stubDep("./cdp.js", {
  ensurePage: async () => {},
  cdpCall: fakeCdpCall,
  navigateAndWait: async () => ({ ok:true }),
  currentTargetId: () => "TARGET-FIXTURE-1"
});
stubDep("./actions.js", { targetOptions: () => ({}) });
stubDep("./logs.js", { readChromeLogs: () => ({ logs:[] }) });
stubDep("./snapshot.js", { pageSnapshot: async () => ({}) });
stubDep("./compact.js", {
  compactLogs: (x) => x,
  compactRemoteResult: (x) => x,
  valueSummary: (x) => x
});

const extras = require(extrasPath);
const { chromeScreenshotReview } = require(visionPath);

function cleanShotDir() {
  fs.rmSync(path.join(SCRATCH_ROOT, ".awtsmoos"), { recursive:true, force:true });
}

test("sidecar JSON is written next to the PNG with the complete schema", async () => {
  const res = await extras.chromeScreenshot({ path:".awtsmoos/chrome/screenshots/prov-a.png" });
  try {
    assert.equal(res.ok, true);
    assert.ok(res.savedPath, "savedPath present");
    const sidecarPath = res.savedPath.replace(/\.png$/, ".sidecar.json");
    assert.ok(fs.existsSync(sidecarPath), "sidecar file exists next to the PNG");
    const sidecar = JSON.parse(fs.readFileSync(sidecarPath, "utf8"));
    for (const key of ["pngPath","sidecarPath","url","targetId","viewport","capturedAt","commitSha","sha256","bytes"]) {
      assert.ok(key in sidecar, "sidecar has " + key);
    }
    assert.equal(sidecar.pngPath, res.savedPath);
    assert.equal(sidecar.sidecarPath, sidecarPath);
    assert.equal(sidecar.url, "https://example.com/under-test");
    assert.equal(sidecar.targetId, "TARGET-FIXTURE-1");
    assert.deepEqual(sidecar.viewport, { width:390, height:844, deviceScaleFactor:2 });
    assert.ok(!Number.isNaN(Date.parse(sidecar.capturedAt)), "capturedAt is ISO-parsable");
    assert.ok(sidecar.commitSha === null || /^[0-9a-f]{40}$/i.test(sidecar.commitSha), "commitSha is null or 40-hex");
    assert.equal(sidecar.sha256, FAKE_PNG_SHA256);
    assert.equal(sidecar.bytes, FAKE_PNG_BYTES.length);
    const onDisk = fs.readFileSync(res.savedPath);
    assert.equal(crypto.createHash("sha256").update(onDisk).digest("hex"), sidecar.sha256, "sidecar sha256 matches PNG bytes on disk");
  } finally {
    cleanShotDir();
  }
});

test("evidence descriptor is present and backward-compatible fields are unchanged", async () => {
  const res = await extras.chromeScreenshot({ path:".awtsmoos/chrome/screenshots/prov-b.png" });
  try {
    assert.equal(res.ok, true);
    assert.equal(res.action, "chromeScreenshot");
    assert.equal(res.format, "png");
    assert.equal(res.bytes, FAKE_PNG_BYTES.length);
    assert.ok(res.savedPath);
    assert.equal(res.content64, "", "content64 stays empty when inline is not true");
    const ev = res.evidence;
    assert.ok(ev, "evidence descriptor present");
    for (const key of ["savedPath","sidecarPath","sha256","url","targetId","viewport","capturedAt","commitSha","bytes","inline"]) {
      assert.ok(key in ev, "evidence has " + key);
    }
    assert.equal(ev.savedPath, res.savedPath);
    assert.equal(ev.sidecarPath, res.savedPath.replace(/\.png$/, ".sidecar.json"));
    assert.equal(ev.sha256, FAKE_PNG_SHA256);
    assert.equal(ev.url, "https://example.com/under-test");
    assert.equal(ev.targetId, "TARGET-FIXTURE-1");
    assert.deepEqual(ev.viewport, { width:390, height:844, deviceScaleFactor:2 });
    assert.equal(ev.bytes, FAKE_PNG_BYTES.length);
    assert.equal(ev.inline, false);
  } finally {
    cleanShotDir();
  }
});

test("inline:true keeps content64 behavior and yields an inline evidence descriptor", async () => {
  const res = await extras.chromeScreenshot({ inline:true });
  assert.equal(res.ok, true);
  assert.equal(res.content64, FAKE_PNG_BASE64, "inline content64 unchanged");
  assert.equal(res.savedPath, null, "no PNG written when inline and no path");
  assert.equal(res.evidence.sidecarPath, null, "no sidecar when nothing was written");
  assert.equal(res.evidence.inline, true);
  assert.equal(res.evidence.sha256, FAKE_PNG_SHA256);
  assert.equal(res.evidence.bytes, FAKE_PNG_BYTES.length);
  assert.ok(!fs.existsSync(path.join(SCRATCH_ROOT, ".awtsmoos")), "nothing written to disk");
});

test("provenance probe asks the page for url and viewport", async () => {
  await extras.chromeScreenshot({ path:".awtsmoos/chrome/screenshots/prov-c.png" });
  try {
    assert.ok(lastEvaluateExpression && lastEvaluateExpression.includes("location.href"), "probe reads location.href");
    assert.ok(lastEvaluateExpression.includes("devicePixelRatio"), "probe reads devicePixelRatio");
  } finally {
    cleanShotDir();
  }
});

test("chromeScreenshotReview fails closed when the caller cannot render images", async () => {
  const res = await chromeScreenshotReview({ declareVision:false });
  assert.equal(res.ok, false);
  assert.equal(res.error, "needs_vision_harness");
  assert.equal(res.note, "caller cannot render images; refusing to certify");
});

test("chromeScreenshotReview delivers a vision package to a capable caller", async () => {
  const res = await chromeScreenshotReview({ declareVision:true });
  assert.equal(res.ok, true);
  assert.equal(res.action, "chromeScreenshotReview");
  assert.ok(res.dataUrl.startsWith("data:image/png;base64,"), "dataUrl is a PNG data URL");
  assert.equal(res.dataUrl.slice("data:image/png;base64,".length), FAKE_PNG_BASE64);
  assert.equal(res.sha256, FAKE_PNG_SHA256);
  assert.ok(res.evidence, "evidence descriptor passed through");
  assert.equal(res.evidence.inline, true);
  assert.equal(res.requiresVisualReview, true);
  assert.ok(typeof res.visualReviewNote === "string" && res.visualReviewNote.includes("MUST"), "visual review note present");
  assert.ok(!fs.existsSync(path.join(SCRATCH_ROOT, ".awtsmoos")), "review capture is inline-only, nothing written to disk");
});

test("chromeScreenshotReview propagates capture failure instead of certifying", async () => {
  failCapture = true;
  try {
    const res = await chromeScreenshotReview({ declareVision:true });
    assert.equal(res.ok, false);
    assert.equal(res.error, "chrome_screenshot_failed");
  } finally {
    failCapture = false;
  }
});

test("failure shape of chromeScreenshot is unchanged", async () => {
  failCapture = true;
  try {
    const res = await extras.chromeScreenshot({ path:".awtsmoos/chrome/screenshots/prov-d.png" });
    assert.equal(res.ok, false);
    assert.equal(res.action, "chromeScreenshot");
    assert.equal(res.error, "chrome_screenshot_failed");
    assert.equal(res.retryable, true);
    assert.ok(!("evidence" in res), "no evidence on failure");
  } finally {
    failCapture = false;
    cleanShotDir();
  }
});
