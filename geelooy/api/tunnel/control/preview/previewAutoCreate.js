// B"H
const { createPreview } = require("./previewStore.js");

/**
 * B"H
 * Chapter 479: The preview action stopped handing the traveler a locked forge.
 * If an authenticated tunnel action returns a preview payload, the control gate
 * now shapes it into a real /view link immediately.
 */
function isPreviewAction(action) {
  return /^preview(File|Folder|Page|Collection|ActionResult|LiveCommand|ExposeLocalServer|Create)$/i.test(String(action || ""));
}

function autoCreatePreviewResult(ident, payload, result) {
  if (!result || result.ok === false || !isPreviewAction(payload.action) || !result.preview) return result;
  const created = createPreview(ident.userId, { ...result.preview, createdBy: result.preview.createdBy || "ai" });
  if (created.ok === false) return { ...result, previewCreateError: created };
  return {
    ...result,
    createdPreview: created,
    previewId: created.id,
    viewUrl: created.viewUrl,
    rawUrl: created.rawUrl,
    wsUrl: created.wsUrl,
    url: created.viewUrl,
    createUrl: result.url
  };
}

module.exports = { autoCreatePreviewResult, isPreviewAction };
