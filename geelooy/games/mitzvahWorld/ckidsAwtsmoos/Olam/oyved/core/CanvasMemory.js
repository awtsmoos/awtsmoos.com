// B"H
/**
 * @file CanvasMemory.js
 * @description
 * Chapter 89: the OffscreenCanvas crosses the river only once. After that, the
 * worker remembers the vessel inside its own chamber. The Awtsmoos lets later
 * worlds drink from the same canvas without asking the main thread to transfer
 * what can never be transferred twice.
 */
let rememberedCanvasPayload = null;

/**
 * Stores the worker-owned canvas payload after first transfer.
 *
 * @param {object} payload
 * Payload containing canvas, size, and devicePixelRatio.
 *
 * @returns {void}
 */
export function rememberCanvasPayload(payload) {
  if (!payload?.canvas) return;
  rememberedCanvasPayload = {
    canvas: payload.canvas,
    devicePixelRatio: payload.devicePixelRatio || 1,
    width: payload.width || 1024,
    height: payload.height || 768
  };
}

/**
 * Rebinds an already transferred canvas to a fresh Olam instance.
 *
 * @param {object} olam
 * Fresh world instance.
 *
 * @returns {Promise<boolean>}
 * True when a remembered canvas was attached.
 */
export async function reattachRememberedCanvas(olam) {
  if (!olam || !rememberedCanvasPayload?.canvas) return false;
  olam.takeInCanvas(rememberedCanvasPayload.canvas, rememberedCanvasPayload.devicePixelRatio);
  if (typeof olam.setSize === "function") await olam.setSize(rememberedCanvasPayload.width, rememberedCanvasPayload.height);
  if (typeof olam.heesHawvoos === "function") olam.heesHawvoos();
  self.postMessage({
    type: "canvas_reused",
    payload: {
      width: rememberedCanvasPayload.width,
      height: rememberedCanvasPayload.height,
      devicePixelRatio: rememberedCanvasPayload.devicePixelRatio,
      rendererReady: Boolean(olam.renderer)
    }
  });
  return true;
}
