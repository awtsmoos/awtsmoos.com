// B"H
/**
 * @file Assistant-side screenshot download driver (Mac -> assistant's device).
 *
 * @description
 * The transfer leg of the screenshot pipeline. The Mac captures the PNG and
 * publishes a transfer descriptor (path, whole-file SHA-256, totalBytes);
 * THIS module runs on the assistant's device and pulls the bytes through the
 * existing file-transfer read primitives (`fileTransferReadChunk` /
 * `fileTransferSourceProof`), which the caller supplies as `readChunk`.
 *
 * Guarantees (the user's rock-solid transfer orders):
 *  1. SHA-256 verified END TO END: every chunk's SHA-256 is checked as it
 *     lands, and the assembled file's SHA-256 must equal the transfer
 *     descriptor's sha256. No match = loud failure, never silent success.
 *  2. Retry with RESUME: a failed or corrupt chunk is re-requested from the
 *     SAME offset (bounded retries with backoff). A flaky tunnel never
 *     silently loses a screenshot; verified bytes are never re-pulled.
 *  3. EXPLICIT failure signaling: every failure names what failed, at which
 *     byte offset, after how many retries. Silent drops are forbidden.
 *  4. FAST: per-leg timings are measured and returned (transferMs here;
 *     captureMs comes from the pipeline). Chunk size is tunable within the
 *     transfer policy bounds (64KB-2MB).
 *  5. DETERMINISTIC destination: the PNG lands at
 *     `<destDir>/<sha256>.png` -- the same pixels always land at the same
 *     path, which the assistant can open and view.
 *  6. VIEWABILITY verified: `verifyPngViewable` parses the PNG header
 *     (magic + IHDR dimensions) instead of assuming the bytes are an image.
 *
 * This module is pure and dependency-injected: it requires nothing
 * Mac-specific at load time, so the same file runs in unit tests, on the
 * assistant's device, or anywhere with node.
 *
 * @example
 * const { downloadScreenshot, verifyPngViewable } = require("./screenshotTransfer.js");
 * const dl = await downloadScreenshot({
 *   transfer: pipelineResult.transfer,          // {path, sha256, totalBytes}
 *   readChunk: (args) => invokeTunnelAction("fileTransferReadChunk", args),
 *   destDir: "/home/assistant/tunnel-evidence/screenshots",
 * });
 * // dl = { ok:true, destPath, sha256, bytes, chunks, retries, transferMs }
 * const view = await verifyPngViewable(dl.destPath);
 */

const crypto = require("crypto");
const fsp = require("fs/promises");
const path = require("path");

const SHA256_RE = /^[0-9a-f]{64}$/;
const MIN_CHUNK_BYTES = 64 * 1024;
const MAX_CHUNK_BYTES = 2 * 1024 * 1024;
const DEFAULT_CHUNK_BYTES = 256 * 1024;
const DEFAULT_MAX_RETRIES = 5;
const DEFAULT_BACKOFF_MS = 400;
const PNG_MAGIC = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * @param {Buffer} buf
 * @returns {string} lowercase hex SHA-256.
 */
function sha256hex(buf) {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Backoff delay for retry attempt n (1-based): 400ms, 800ms, 1600ms, ...
 * capped at 5s.
 * @param {number} attempt
 * @returns {number}
 */
function backoffMs(attempt) {
  return Math.min(5000, DEFAULT_BACKOFF_MS * 2 ** (attempt - 1));
}

/**
 * Validate a transfer descriptor. Fails closed on anything malformed.
 * @param {object} transfer {path, sha256, totalBytes}
 * @returns {{path:string, sha256:string, totalBytes:number}|{error:object}}
 */
function validateTransfer(transfer) {
  const action = "screenshotTransfer";
  if (!transfer || typeof transfer !== "object") {
    return { error: { ok:false, action, error:"screenshot_transfer_invalid_descriptor", detail:"transfer descriptor is missing" } };
  }
  const sha256 = String(transfer.sha256 || "").toLowerCase();
  if (!SHA256_RE.test(sha256)) {
    return { error: { ok:false, action, error:"screenshot_transfer_invalid_descriptor", detail:"transfer.sha256 must be 64-char hex" } };
  }
  const totalBytes = Number(transfer.totalBytes);
  if (!Number.isSafeInteger(totalBytes) || totalBytes <= 0) {
    return { error: { ok:false, action, error:"screenshot_transfer_invalid_descriptor", detail:"transfer.totalBytes must be a positive integer" } };
  }
  const remotePath = String(transfer.path || "");
  if (!remotePath) {
    return { error: { ok:false, action, error:"screenshot_transfer_invalid_descriptor", detail:"transfer.path is required" } };
  }
  return { path: remotePath, sha256, totalBytes };
}

/**
 * Download a screenshot through chunked, hash-verified, resumable reads.
 *
 * @param {object} opts
 * @param {object} opts.transfer {path, sha256, totalBytes[, chunkBytes]} from the pipeline evidence.
 * @param {function} opts.readChunk async ({path, offset, maxBytes}) ->
 *   {content64, sha256, nextOffset, eof}. Supplied by the caller (tunnel
 *   action `fileTransferReadChunk`, GET route, or test stub).
 * @param {string} opts.destDir Assistant-side directory; the PNG lands at
 *   `<destDir>/<sha256>.png` (deterministic).
 * @param {number} [opts.chunkBytes] bytes per chunk, clamped to 64KB-2MB.
 * @param {number} [opts.maxRetries] per-chunk retries (default 5).
 * @param {function} [opts.onProgress] ({offset, totalBytes, chunks}) per chunk.
 * @param {function} [opts.sleep] injectable sleep for tests.
 * @returns {Promise<object>} {ok:true, action, destPath, sha256, bytes,
 *   chunks, retries, transferMs} or LOUD {ok:false, action, error, detail}.
 */
async function downloadScreenshot(opts = {}) {
  const action = "screenshotTransfer";
  const startedAt = Date.now();
  const sleepFn = opts.sleep || sleep;

  const valid = validateTransfer(opts.transfer);
  if (valid.error) return valid.error;
  const { path: remotePath, sha256: expectedSha256, totalBytes } = valid;

  if (typeof opts.readChunk !== "function") {
    return { ok:false, action, error:"screenshot_transfer_no_reader", detail:"opts.readChunk must be an async function" };
  }
  const destDir = String(opts.destDir || "");
  if (!destDir) {
    return { ok:false, action, error:"screenshot_transfer_no_dest", detail:"opts.destDir is required" };
  }
  const chunkBytes = Math.max(MIN_CHUNK_BYTES, Math.min(MAX_CHUNK_BYTES,
    Math.floor(Number(opts.chunkBytes || opts.transfer.chunkBytes) || DEFAULT_CHUNK_BYTES)));
  const maxRetries = Math.max(0, Math.floor(Number(opts.maxRetries ?? DEFAULT_MAX_RETRIES)));

  const buffers = [];
  const hasher = crypto.createHash("sha256");
  let offset = 0;
  let chunks = 0;
  let retries = 0;

  while (offset < totalBytes) {
    let attempt = 0;
    let chunk = null;
    let bytes = null;
    // Retry loop: re-request the SAME offset until the chunk verifies
    // (resume), then move on. Verified bytes are never re-pulled.
    for (;;) {
      let raw;
      try {
        raw = await opts.readChunk({ path: remotePath, offset, maxBytes: chunkBytes });
      } catch (e) {
        attempt++;
        if (attempt > maxRetries) {
          return {
            ok:false, action, error:"screenshot_transfer_chunk_failed",
            detail:`chunk at offset ${offset} of ${totalBytes} failed after ${maxRetries} retries: ${String((e && e.message) || e)}`,
            offset, totalBytes, retries: retries + attempt,
          };
        }
        await sleepFn(backoffMs(attempt));
        continue;
      }
      chunk = raw || {};
      bytes = Buffer.from(chunk.content64 || "", "base64");
      if (!bytes.length && offset < totalBytes) {
        attempt++;
        if (attempt > maxRetries) {
          return {
            ok:false, action, error:"screenshot_transfer_empty_chunk",
            detail:`chunk at offset ${offset} of ${totalBytes} returned zero bytes after ${maxRetries} retries`,
            offset, totalBytes, retries: retries + attempt,
          };
        }
        await sleepFn(backoffMs(attempt));
        continue;
      }
      const chunkSha = sha256hex(bytes);
      if (chunk.sha256 && String(chunk.sha256).toLowerCase() !== chunkSha) {
        attempt++;
        if (attempt > maxRetries) {
          return {
            ok:false, action, error:"screenshot_transfer_chunk_corrupt",
            detail:`chunk at offset ${offset} failed SHA-256 verification after ${maxRetries} retries (expected ${chunk.sha256}, got ${chunkSha})`,
            offset, totalBytes, retries: retries + attempt,
          };
        }
        await sleepFn(backoffMs(attempt));
        continue; // resume: same offset, fresh bytes
      }
      break; // chunk verified
    }
    retries += attempt;

    const next = Number(chunk.nextOffset);
    if (!Number.isSafeInteger(next) || next <= offset || next > totalBytes) {
      return {
        ok:false, action, error:"screenshot_transfer_bad_offset",
        detail:`chunk at offset ${offset} reported nextOffset ${chunk.nextOffset} (totalBytes ${totalBytes}); refusing to continue a lying stream`,
        offset, totalBytes, retries,
      };
    }
    hasher.update(bytes);
    buffers.push(bytes);
    chunks++;
    offset = next;
    if (typeof opts.onProgress === "function") {
      try { opts.onProgress({ offset, totalBytes, chunks }); } catch (e) { /* progress must never break the transfer */ }
    }
    if (chunk.eof === true) break;
    if (offset >= totalBytes) break;
  }

  // END-TO-END verification: the assembled bytes must hash to the exact
  // SHA-256 the Mac attested in the transfer descriptor.
  const fileSha256 = hasher.digest("hex");
  if (fileSha256 !== expectedSha256) {
    return {
      ok:false, action, error:"screenshot_transfer_hash_mismatch",
      detail:`assembled ${chunks} chunk(s) / ${offset} bytes but SHA-256 ${fileSha256} !== expected ${expectedSha256}; refusing to deliver corrupt pixels`,
      expectedSha256, actualSha256: fileSha256, chunks, retries,
    };
  }

  // Deterministic landing: same pixels -> same path, always.
  const destPath = path.join(destDir, expectedSha256 + ".png");
  try {
    await fsp.mkdir(destDir, { recursive: true });
    await fsp.writeFile(destPath, Buffer.concat(buffers));
  } catch (e) {
    return {
      ok:false, action, error:"screenshot_transfer_write_failed",
      detail:`verified ${offset} bytes (sha256 ${fileSha256}) but could not write ${destPath}: ${String((e && e.message) || e)}`,
      destPath,
    };
  }

  return {
    ok:true, action, destPath, sha256: fileSha256, bytes: offset,
    chunks, retries, transferMs: Date.now() - startedAt,
  };
}

/**
 * Verify that a landed file is actually a viewable PNG: magic bytes plus
 * IHDR dimensions parsed from the header. Never assume.
 * @param {string} destPath
 * @returns {Promise<{ok:boolean, width?:number, height?:number, bytes?:number, error?:string, detail?:string}>}
 */
async function verifyPngViewable(destPath) {
  const action = "screenshotTransferVerify";
  try {
    const buf = await fsp.readFile(destPath);
    if (buf.length < 33 || !buf.subarray(0, 8).equals(PNG_MAGIC)) {
      return { ok:false, action, error:"screenshot_not_viewable", detail:`${destPath}: missing PNG magic (${buf.length} bytes)` };
    }
    // IHDR must be the first chunk: length(4) + "IHDR"(4) + width(4) + height(4).
    const ihdrLen = buf.readUInt32BE(8);
    const ihdrType = buf.subarray(12, 16).toString("ascii");
    if (ihdrType !== "IHDR" || ihdrLen !== 13) {
      return { ok:false, action, error:"screenshot_not_viewable", detail:`${destPath}: first chunk is not IHDR` };
    }
    const width = buf.readUInt32BE(16);
    const height = buf.readUInt32BE(20);
    if (!width || !height || width > 16384 || height > 16384) {
      return { ok:false, action, error:"screenshot_not_viewable", detail:`${destPath}: implausible dimensions ${width}x${height}` };
    }
    return { ok:true, action, destPath, width, height, bytes: buf.length };
  } catch (e) {
    return { ok:false, action, error:"screenshot_not_viewable", detail:`${destPath}: ${String((e && e.message) || e)}` };
  }
}

module.exports = {
  downloadScreenshot,
  verifyPngViewable,
  // Exported for fixture-driven tests:
  validateTransfer,
  backoffMs,
  SHA256_RE,
};
