// B"H
// screenshotTransfer.test.cjs
// Proves the rock-solid transfer leg without a live tunnel:
//   - per-chunk SHA-256 verification (corrupt chunk -> retry same offset),
//   - retry with RESUME (failed chunk re-requested; verified bytes never re-pulled),
//   - loud explicit failures (chunk failed, chunk corrupt, hash mismatch, bad offset),
//   - end-to-end whole-file SHA-256 match required for success,
//   - deterministic landing path <destDir>/<sha256>.png,
//   - viewability verification parses PNG magic + IHDR dimensions,
//   - per-leg timing reported (transferMs present and sane).
const test = require("node:test");
const assert = require("node:assert/strict");
const crypto = require("crypto");
const fs = require("fs");
const os = require("os");
const path = require("path");

const transfer = require("../tools/chrome/screenshotTransfer.js");

// Build a deterministic fake PNG: real header + IHDR + filler.
function makePng(totalBytes, width = 390, height = 844) {
  const ihdr = Buffer.alloc(25);
  ihdr.writeUInt32BE(13, 0);
  ihdr.write("IHDR", 4);
  ihdr.writeUInt32BE(width, 8);
  ihdr.writeUInt32BE(height, 12);
  const magic = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  const body = Buffer.alloc(Math.max(0, totalBytes - magic.length - ihdr.length), 0xab);
  return Buffer.concat([magic, ihdr, body]);
}

const PNG = makePng(200 * 1024); // 200KB -> 4 chunks at 64KB
const PNG_SHA = crypto.createHash("sha256").update(PNG).digest("hex");
const descriptor = { path: ".awtsmoos/chrome/evidence/" + PNG_SHA + ".png", sha256: PNG_SHA, totalBytes: PNG.length };

function chunkSha(buf) { return crypto.createHash("sha256").update(buf).digest("hex"); }

/** readChunk stub slicing the real PNG; honors offset/maxBytes like the primitive. */
function makeReader({ failOffsets = {}, corruptOffsets = {} } = {}) {
  const seen = [];
  const attempts = {};
  return {
    seen,
    readChunk: async ({ path: p, offset, maxBytes }) => {
      seen.push(offset);
      attempts[offset] = (attempts[offset] || 0) + 1;
      if (failOffsets[offset] && attempts[offset] <= failOffsets[offset]) {
        throw new Error("tunnel flap (injected)");
      }
      const slice = PNG.subarray(offset, Math.min(offset + maxBytes, PNG.length));
      let content64 = slice.toString("base64");
      let sha = chunkSha(slice);
      if (corruptOffsets[offset] && attempts[offset] <= corruptOffsets[offset]) {
        content64 = Buffer.from("corrupt-bytes").toString("base64"); // hash won't match
      }
      const nextOffset = offset + slice.length;
      return {
        path: p, offset, returnedBytes: slice.length, totalBytes: PNG.length,
        sha256: sha, content64, nextOffset, eof: nextOffset >= PNG.length,
      };
    },
  };
}

function scratchDir() { return fs.mkdtempSync(path.join(os.tmpdir(), "shotxfer-")); }
const noSleep = async () => {};

test("happy path: chunked, hash-verified, deterministic landing, timed", async () => {
  const reader = makeReader();
  const destDir = scratchDir();
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: reader.readChunk, destDir,
    chunkBytes: 64 * 1024, sleep: noSleep,
  });
  assert.equal(res.ok, true, JSON.stringify(res).slice(0, 300));
  assert.equal(res.sha256, PNG_SHA);
  assert.equal(res.bytes, PNG.length);
  assert.equal(res.chunks, 4, "200KB / 64KB = 4 chunks");
  assert.equal(res.retries, 0);
  assert.equal(res.destPath, path.join(destDir, PNG_SHA + ".png"), "deterministic content-addressed path");
  assert.ok(fs.readFileSync(res.destPath).equals(PNG), "landed bytes are the exact PNG");
  assert.ok(typeof res.transferMs === "number" && res.transferMs >= 0, "transferMs reported");
  assert.deepEqual(reader.seen, [0, 65536, 131072, 196608], "sequential offsets, no re-pulls");
});

test("retry with RESUME: flaky chunk re-requested from same offset", async () => {
  const reader = makeReader({ failOffsets: { 65536: 2 } }); // chunk 2 fails twice
  const destDir = scratchDir();
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: reader.readChunk, destDir,
    chunkBytes: 64 * 1024, sleep: noSleep,
  });
  assert.equal(res.ok, true);
  assert.equal(res.sha256, PNG_SHA);
  assert.equal(res.retries, 2);
  const chunk2Attempts = reader.seen.filter((o) => o === 65536).length;
  assert.equal(chunk2Attempts, 3, "failed chunk retried from the SAME offset");
  assert.ok(!reader.seen.includes(-1), "no bogus offsets");
});

test("corrupt chunk (hash mismatch) is discarded and re-pulled", async () => {
  const reader = makeReader({ corruptOffsets: { 0: 1 } }); // first chunk corrupt once
  const destDir = scratchDir();
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: reader.readChunk, destDir,
    chunkBytes: 64 * 1024, sleep: noSleep,
  });
  assert.equal(res.ok, true);
  assert.equal(res.sha256, PNG_SHA, "corrupt bytes never made it into the file");
  assert.equal(res.retries, 1);
});

test("persistent chunk failure is LOUD (never silent)", async () => {
  const reader = makeReader({ failOffsets: { 131072: 99 } });
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: reader.readChunk, destDir: scratchDir(),
    chunkBytes: 64 * 1024, maxRetries: 3, sleep: noSleep,
  });
  assert.equal(res.ok, false);
  assert.equal(res.error, "screenshot_transfer_chunk_failed");
  assert.ok(res.detail.includes("offset 131072"), "names the failed offset: " + res.detail);
  assert.ok(res.detail.includes("3 retries"), "names the retry count: " + res.detail);
});

test("whole-file hash mismatch is LOUD", async () => {
  // Reader serves a different file than the descriptor attests.
  const other = makePng(200 * 1024, 100, 100);
  const evilReader = {
    readChunk: async ({ offset, maxBytes }) => {
      const slice = other.subarray(offset, Math.min(offset + maxBytes, other.length));
      const nextOffset = offset + slice.length;
      return { sha256: chunkSha(slice), content64: slice.toString("base64"), nextOffset, eof: nextOffset >= other.length };
    },
  };
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: evilReader.readChunk, destDir: scratchDir(),
    chunkBytes: 64 * 1024, sleep: noSleep,
  });
  assert.equal(res.ok, false);
  assert.equal(res.error, "screenshot_transfer_hash_mismatch");
  assert.ok(res.detail.includes(PNG_SHA), "names the expected hash");
});

test("lying nextOffset fails closed", async () => {
  const liar = {
    readChunk: async ({ offset }) => ({
      sha256: chunkSha(PNG.subarray(offset, offset + 100)),
      content64: PNG.subarray(offset, offset + 100).toString("base64"),
      nextOffset: offset, // never advances
      eof: false,
    }),
  };
  const res = await transfer.downloadScreenshot({
    transfer: descriptor, readChunk: liar.readChunk, destDir: scratchDir(),
    chunkBytes: 64 * 1024, sleep: noSleep,
  });
  assert.equal(res.ok, false);
  assert.equal(res.error, "screenshot_transfer_bad_offset");
});

test("invalid descriptors fail closed", async () => {
  const reader = makeReader();
  for (const bad of [null, {}, { sha256: "xyz", totalBytes: 10, path: "x" }, { sha256: PNG_SHA, totalBytes: 0, path: "x" }]) {
    const res = await transfer.downloadScreenshot({ transfer: bad, readChunk: reader.readChunk, destDir: scratchDir(), sleep: noSleep });
    assert.equal(res.ok, false, JSON.stringify(bad));
    assert.equal(res.error, "screenshot_transfer_invalid_descriptor");
  }
});

test("verifyPngViewable parses magic and IHDR dimensions", async () => {
  const destDir = scratchDir();
  const p = path.join(destDir, "v.png");
  fs.writeFileSync(p, PNG);
  const v = await transfer.verifyPngViewable(p);
  assert.equal(v.ok, true);
  assert.equal(v.width, 390);
  assert.equal(v.height, 844);
  assert.equal(v.bytes, PNG.length);

  const notPng = path.join(destDir, "n.png");
  fs.writeFileSync(notPng, Buffer.from("hello world, not a png...................."));
  const v2 = await transfer.verifyPngViewable(notPng);
  assert.equal(v2.ok, false);
  assert.equal(v2.error, "screenshot_not_viewable");

  const v3 = await transfer.verifyPngViewable(path.join(destDir, "missing.png"));
  assert.equal(v3.ok, false);
});

test("backoff grows and caps", () => {
  assert.equal(transfer.backoffMs(1), 400);
  assert.equal(transfer.backoffMs(2), 800);
  assert.equal(transfer.backoffMs(3), 1600);
  assert.equal(transfer.backoffMs(20), 5000, "capped at 5s");
});
