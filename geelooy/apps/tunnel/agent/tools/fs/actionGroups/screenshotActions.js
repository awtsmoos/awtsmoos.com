// B"H
// Boruch Hashem
// Blessed is He

'use strict';

/**
 * screenshotActions.js — tunnel action group for the hardened screenshot pipeline.
 *
 * Registers the first-class screenshot workflow as tunnel actions:
 *
 *   chromeScreenshotPipeline        fresh target -> exact url -> exact viewport
 *                                   -> readiness wait -> real PNG -> SHA-256 ->
 *                                   deterministic evidence path -> inline
 *                                   dataUrl for the AI reviewer.
 *   chromeScreenshotPipelineReview  same pipeline packaged under the vision
 *                                   delivery contract (fails closed when the
 *                                   caller declares it cannot render images).
 *   chromeScreenshotReviewRecord    sign a visual-review receipt
 *                                   {sha256, verdict, reviewer, note} bound to
 *                                   the pipeline evidence for that sha.
 *   chromeScreenshotReviewRead      read a previously recorded review receipt.
 *
 * Sibling modules are required DEFENSIVELY (house pattern, see
 * visualGateActions.js): if screenshotPipeline.js or visionDelivery.js cannot
 * be loaded, every action fails closed with
 * error "screenshot_pipeline_unavailable" instead of silently passing.
 *
 * Registration follows the build*Actions(ctx) convention used by the other
 * agent/tools/fs/actionGroups modules: the builder destructures
 * { config, payload } and returns a map of action names to zero-argument
 * async handlers closing over them.
 */

/** @type {object|null} */
let screenshotPipeline = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  screenshotPipeline = require('../../chrome/screenshotPipeline.js');
} catch (e) {
  screenshotPipeline = null;
}

/** @type {object|null} */
let visionDelivery = null;
try {
  // eslint-disable-next-line global-require, import/no-unresolved
  visionDelivery = require('../../chrome/visionDelivery.js');
} catch (e) {
  visionDelivery = null;
}

/**
 * Fail-closed result when the pipeline module is unavailable.
 * @param {string} action Action name being invoked.
 * @returns {object}
 */
function pipelineUnavailable(action) {
  return {
    ok: false,
    action,
    error: 'screenshot_pipeline_unavailable',
    note: 'agent/tools/chrome/screenshotPipeline.js could not be loaded; refusing to certify'
  };
}

/**
 * Build the tunnel action surface for the screenshot pipeline.
 * @param {object} ctx - Action context; destructured as { config, payload }.
 * @returns {{chromeScreenshotPipeline:function,chromeScreenshotPipelineReview:function,chromeScreenshotTransfer:function,chromeScreenshotReviewRecord:function,chromeScreenshotReviewRead:function}}
 */
function buildScreenshotActions({ config, payload }) {
  const p = payload || {};
  return {
    /**
     * Run the full pipeline. Payload: { url (REQUIRED), viewport,
     * fullPage, navTimeoutMs, readyTimeoutMs, waitMs, waitForSelector,
     * readyExpression, commitSha, port, closeTarget }.
     */
    chromeScreenshotPipeline: async () => {
      if (!screenshotPipeline) return pipelineUnavailable('chromeScreenshotPipeline');
      // Primary path: preview-link verification for localhost serves.
      // Fallback: direct-URL capture (existing behavior).
      const wantsPreview = (p.preview && p.preview.port) || p.previewPort;
      if (wantsPreview && typeof screenshotPipeline.runPreviewScreenshotPipeline === 'function') {
        return screenshotPipeline.runPreviewScreenshotPipeline({ ...p, config });
      }
      return screenshotPipeline.runScreenshotPipeline({ ...p, config });
    },
    /**
     * Run the pipeline under the vision contract. Same payload plus
     * declareVision (false fails closed with needs_vision_harness).
     */
    chromeScreenshotPipelineReview: async () => {
      if (!visionDelivery || typeof visionDelivery.chromeScreenshotPipelineReview !== 'function') {
        return pipelineUnavailable('chromeScreenshotPipelineReview');
      }
      return visionDelivery.chromeScreenshotPipelineReview(p);
    },
    /**
     * Capture for the chunked transfer path: runs the pipeline (preview-aware)
     * with inline:false and returns the download handle -- evidence plus the
     * transfer descriptor the assistant pulls with fileTransferReadChunk (or
     * the screenshotTransfer driver). No PNG bytes ride the result.
     */
    chromeScreenshotTransfer: async () => {
      if (!screenshotPipeline) return pipelineUnavailable('chromeScreenshotTransfer');
      const p2 = { ...p, inline: false };
      const wantsPreview = (p2.preview && p2.preview.port) || p2.previewPort;
      const runner = (wantsPreview && typeof screenshotPipeline.runPreviewScreenshotPipeline === 'function')
        ? screenshotPipeline.runPreviewScreenshotPipeline
        : screenshotPipeline.runScreenshotPipeline;
      const res = await runner(p2);
      if (!res || res.ok !== true) return res;
      return {
        ok: true,
        action: 'chromeScreenshotTransfer',
        evidence: res.evidence,
        transfer: res.transfer || (res.evidence && res.evidence.transfer) || null,
        requiresVisualReview: true,
        transferNote: 'Pull chunks with fileTransferReadChunk (or the screenshotTransfer driver) and verify the whole-file SHA-256 before viewing.',
      };
    },
    /**
     * Sign a visual-review receipt. Payload: { sha256, verdict
     * ("pass"|"fail"|"needs-work"), reviewer, note }.
     */
    chromeScreenshotReviewRecord: async () => {
      if (!screenshotPipeline) return pipelineUnavailable('chromeScreenshotReviewRecord');
      return screenshotPipeline.recordScreenshotReview(p);
    },
    /**
     * Read a review receipt. Payload: { sha256 }.
     */
    chromeScreenshotReviewRead: async () => {
      if (!screenshotPipeline) return pipelineUnavailable('chromeScreenshotReviewRead');
      return screenshotPipeline.readScreenshotReview(p.sha256);
    },
  };
}

module.exports = {
  buildScreenshotActions,
};
