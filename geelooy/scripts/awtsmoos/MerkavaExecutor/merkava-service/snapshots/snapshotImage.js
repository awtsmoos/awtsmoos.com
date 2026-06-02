// B"H
/**
 * @file snapshotImage.js
 * @description
 * Merkava is the default eye. Chrome is opt-in only. Renderer proof metadata is
 * preserved so tests can reject pretty lies and require actual pixel evidence.
 */
import { captureChromeScreenshot } from "./chromeScreenshot.js";
import { renderVirtualSnapshotPng } from "./virtualPngRenderer.js";

export async function enrichSnapshotImage(snapshot = {}, options = {}) {
  if (!options.wantImage) return snapshot;
  const width = Number(options.width || 960);
  const height = Number(options.height || 640);
  const backend = String(options.backend || "merkava").toLowerCase();
  const useChrome = backend === "chrome" || backend === "browser" || backend === "chromium";
  const chrome = useChrome ? captureChromeScreenshot({ html: snapshot.html || "", width, height, timeoutMs: options.timeoutMs || 20000 }) : { ok: false, reason: "merkava_default" };
  const image = chrome.ok ? chrome : renderVirtualSnapshotPng(snapshot, { width, height });
  return {
    ...snapshot,
    dataUrl: image.dataUrl,
    pngDataUrl: image.dataUrl,
    image: {
      backend: image.backend,
      mimeType: image.mimeType || "image/png",
      width: image.width || width,
      height: image.height || height,
      bytes: image.bytes || 0,
      dataUrl: image.dataUrl,
      note: image.note || null,
      proof: image.proof || null,
      chrome: image.chrome || null,
      fallbackReason: chrome.ok ? null : chrome.reason || "merkava_default"
    }
  };
}

export function wantsSnapshotImage(options = {}) {
  const format = String(options.format || "json").toLowerCase();
  return Boolean(options.snapshot) && ["png", "image", "screenshot", "all", "json"].includes(format);
}
