// B"H
/**
 * @file Screenshot-to-vision delivery for the tunnel chrome tools.
 *
 * @description
 * Bridges the screenshot pipeline to a vision-capable reviewer. The hardened
 * `chromeScreenshot` (agent/tools/chrome/extras.js) already writes a PNG +
 * sidecar JSON to Mac disk and returns an evidence descriptor, but nothing in
 * `agent/` renders those pixels to the calling model. This module exports the
 * `chromeScreenshotReview` action handler, which captures with `inline:true`
 * and returns the PNG as a `dataUrl` in the tool result so a vision-capable
 * client harness can actually look at the rendered page.
 *
 * It also exports `chromeScreenshotPipelineReview`, which runs the full
 * first-class pipeline (agent/tools/chrome/screenshotPipeline.js): fresh
 * Chrome target -> navigate to the exact url -> exact viewport -> readiness
 * wait -> real PNG -> SHA-256 -> deterministic evidence path -> inline
 * dataUrl for the AI reviewer -> visual-review receipt helpers.
 *
 * When the underlying capture does not carry an evidence descriptor (older
 * `chromeScreenshot`), this module DERIVES one from the delivered bytes --
 * sha256 of the exact PNG handed to the reviewer -- so the review receipt
 * can never drift from the pixels that were actually seen.
 *
 * Client-harness contract (what the harness MUST do):
 *   1. Register this module's `chromeScreenshotReview` as the
 *      `chromeScreenshotReview` action (see agent/tools/chrome/index.js).
 *   2. On a successful result, render `dataUrl` ("data:image/png;base64,...")
 *      as an image and present it to a vision-capable model (or a human) for
 *      visual inspection BEFORE the caller claims anything is
 *      "verified", "fixed", or "done".
 *   3. Any visual-review receipt must reference `evidence.sha256`,
 *      `evidence.capturedAt`, and `evidence.commitSha` so the review is tied
 *      to the exact pixels, moment, and code that were captured; stale or
 *      mismatched evidence must be rejected by the caller.
 *   4. If the caller cannot render images at all, it MUST pass
 *      `declareVision:false`. The action then FAILS CLOSED with
 *      `error:"needs_vision_harness"` and refuses to certify anything,
 *      instead of returning an unviewed image that a text-only agent could
 *      mistake for verification.
 *
 * @example
 * // vision-capable caller
 * const res = await chromeScreenshotReview({ declareVision:true, fullPage:false });
 * // res = { ok:true, action:"chromeScreenshotReview", dataUrl, sha256,
 * //         evidence, requiresVisualReview:true, visualReviewNote }
 *
 * @example
 * // full pipeline: exact url + exact viewport + readiness gate
 * const res2 = await chromeScreenshotPipelineReview({
 *   declareVision:true,
 *   url:"https://awtsmoos.com/heichelos/ikar",
 *   viewport:{ width:390, height:844, deviceScaleFactor:2, mobile:true },
 * });
 */
const crypto = require("crypto");
const { chromeScreenshot } = require("./extras.js");

const VISUAL_REVIEW_NOTE = "A model or human MUST visually inspect this image before any verified/fixed claim.";

/**
 * Build the evidence descriptor for delivered bytes. Uses the capture's own
 * descriptor when present; otherwise derives sha256/bytes/capturedAt from
 * the exact PNG handed to the reviewer, so the receipt always matches the
 * pixels that were seen.
 * @param {object} shot Result of chromeScreenshot with inline:true.
 * @param {string} format Image format ("png").
 * @returns {{sha256:string, evidence:object, byteLength:number}}
 */
function evidenceForShot(shot, format) {
  const pngBytes = Buffer.from((shot && shot.content64) || "", "base64");
  const derivedSha256 = crypto.createHash("sha256").update(pngBytes).digest("hex");
  const evidence = (shot && shot.evidence && typeof shot.evidence === "object")
    ? { ...shot.evidence }
    : { action: "chromeScreenshotReview" };
  if (!evidence.sha256) evidence.sha256 = derivedSha256;
  if (!evidence.format) evidence.format = format;
  if (!evidence.bytes) evidence.bytes = pngBytes.length;
  if (!evidence.capturedAt) evidence.capturedAt = new Date().toISOString();
  evidence.inline = true;
  return { sha256: evidence.sha256, evidence, byteLength: pngBytes.length };
}

/**
 * Capture a screenshot and package it for a vision-capable reviewer.
 *
 * @param {object} [payload={}] Action payload. Accepts every
 *   `chromeScreenshot` field (port, scope/target fields, format, fullPage,
 *   path, waitMs, ...) plus `declareVision`.
 * @param {boolean} [payload.declareVision] The caller MUST pass `false` when
 *   it cannot render images. `false` fails closed with
 *   `error:"needs_vision_harness"`; anything else proceeds (the caller is
 *   asserting it can render `dataUrl`).
 * @returns {Promise<object>} On success:
 *   `{ok:true, action:"chromeScreenshotReview", dataUrl, sha256, evidence,
 *   requiresVisualReview:true, visualReviewNote}` where `evidence` is the
 *   hardened descriptor from `chromeScreenshot` (or derived from the bytes
 *   when the capture carries none). On failure:
 *   `{ok:false, action:"chromeScreenshotReview", error, ...}`.
 */
async function chromeScreenshotReview(payload = {}) {
  if (payload.declareVision === false) {
    return {
      ok:false,
      action:"chromeScreenshotReview",
      error:"needs_vision_harness",
      note:"caller cannot render images; refusing to certify"
    };
  }
  const shot = await chromeScreenshot({ ...payload, inline:true });
  if (!shot || shot.ok !== true) {
    return {
      ok:false,
      action:"chromeScreenshotReview",
      error:(shot && shot.error) || "chrome_screenshot_review_failed",
      detail:shot && shot.detail ? shot.detail : undefined,
      evidence:shot && shot.evidence ? shot.evidence : undefined
    };
  }
  const format = String(shot.format || "png").toLowerCase();
  const mime = format === "jpg" ? "jpeg" : format;
  const { sha256, evidence } = evidenceForShot(shot, format);
  return {
    ok:true,
    action:"chromeScreenshotReview",
    dataUrl:"data:image/" + mime + ";base64," + (shot.content64 || ""),
    sha256,
    evidence,
    requiresVisualReview:true,
    visualReviewNote:VISUAL_REVIEW_NOTE
  };
}

/**
 * Run the full screenshot pipeline and package it for a vision-capable
 * reviewer: fresh target, exact url, exact viewport, readiness gate, real
 * PNG bytes inline, deterministic evidence path, SHA-256 provenance.
 *
 * @param {object} [payload={}] `runScreenshotPipeline` fields (url REQUIRED,
 *   viewport, fullPage, waitForSelector, readyExpression, ...) plus
 *   `declareVision`.
 * @returns {Promise<object>} Same vision-package shape as
 *   `chromeScreenshotReview` with action
 *   `"chromeScreenshotPipelineReview"`, or a fail-closed error.
 */
async function chromeScreenshotPipelineReview(payload = {}) {
  const action = "chromeScreenshotPipelineReview";
  if (payload.declareVision === false) {
    return {
      ok:false,
      action,
      error:"needs_vision_harness",
      note:"caller cannot render images; refusing to certify"
    };
  }
  let pipeline;
  try {
    pipeline = require("./screenshotPipeline.js");
  } catch (e) {
    return {
      ok:false,
      action,
      error:"screenshot_pipeline_unavailable",
      detail:String((e && e.message) || e)
    };
  }
  const wantsPreview = (payload.preview && payload.preview.port) || payload.previewPort;
  const runner = (wantsPreview && typeof pipeline.runPreviewScreenshotPipeline === 'function')
    ? pipeline.runPreviewScreenshotPipeline
    : pipeline.runScreenshotPipeline;
  const res = await runner(payload);
  if (!res || res.ok !== true) {
    return {
      ok:false,
      action,
      error:(res && res.error) || "screenshot_pipeline_review_failed",
      detail:res && res.detail ? res.detail : undefined,
      evidence:res && res.evidence ? res.evidence : undefined
    };
  }
  return {
    ok:true,
    action,
    dataUrl:res.dataUrl,
    sha256:res.sha256,
    evidence:res.evidence,
    requiresVisualReview:true,
    visualReviewNote:res.visualReviewNote || VISUAL_REVIEW_NOTE
  };
}

module.exports = {
  chromeScreenshotReview,
  chromeScreenshotPipelineReview,
  // Exported for fixture-driven tests (no live browser needed):
  evidenceForShot,
};
