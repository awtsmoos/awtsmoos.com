// B"H
/**
 * @file core.js
 * @description
 * Chapter 422: The canvas enters the worker without carrying a boulder.
 *
 * The browser still gives us the truthful screen size, but raw pixel ratio can
 * demand more pixels than the game can spend. This gate now sends a governed
 * ratio, so the world remains crisp enough for the eye and quick enough for
 * the hand.
 */
import { measureRenderViewport } from "../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

/**
 * Captures the canvas and packages it for worker rendering.
 *
 * @param {HTMLCanvasElement} canvasElement Canvas element to transfer.
 * @returns {{ canvas: OffscreenCanvas, dimensions: { width: number, height: number, pixelRatio: number, rawPixelRatio: number }}|null}
 * Worker handoff payload, or null when transfer is unavailable.
 */
export function heescheel(canvasElement) {
  console.group('B"H - HEESCHEEL: Initiating Dimensional Transfer');

  const sizing = measureRenderViewport(window, "initial");

  if (!canvasElement || !canvasElement.transferControlToOffscreen) {
    console.error('B"H - CRITICAL: Transfer failed.');
    console.groupEnd();
    return null;
  }

  const offscreen = canvasElement.transferControlToOffscreen();
  const payload = {
    canvas: offscreen,
    dimensions: {
      width: sizing.width,
      height: sizing.height,
      pixelRatio: sizing.pixelRatio,
      rawPixelRatio: sizing.rawPixelRatio
    }
  };

  console.groupEnd();
  return payload;
}

