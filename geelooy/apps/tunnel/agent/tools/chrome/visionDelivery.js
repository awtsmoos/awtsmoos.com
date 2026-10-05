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
 */
const { chromeScreenshot } = require("./extras.js");

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
 *   hardened descriptor from `chromeScreenshot`. On failure:
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
  return {
    ok:true,
    action:"chromeScreenshotReview",
    dataUrl:"data:image/" + mime + ";base64," + (shot.content64 || ""),
    sha256:shot.evidence ? shot.evidence.sha256 : undefined,
    evidence:shot.evidence,
    requiresVisualReview:true,
    visualReviewNote:"A model or human MUST visually inspect this image before any verified/fixed claim."
  };
}

module.exports = { chromeScreenshotReview };
