// B"H
/**
 * @module MasterCanvasSetup
 * @description Chapter 12: Quiet bh17 canvas setup.
 */
import WebGLGuard from "./canvas/WebGLGuard.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import RendererFactory from "./canvas/RendererFactory.js?compact=true&v=high-performance-context-20260621-bh1";
import ViewportSizer from "./canvas/ViewportSizer.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import ContextMonitor from "./canvas/ContextMonitor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import UIRectifier from "./ui/UIRectifier.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";
import { resolvePixelRatio } from "../../divine_systems/render/core/PixelRatioGovernor.js?compact=true&v=visible-house-mesh-only-octree-20260708-bh1";

export default class MasterCanvasSetup {
  /** Accepts the transferred canvas and creates the renderer. */
  takeInCanvas(canvas, devicePixelRatio = 1) {
    const guard = WebGLGuard.verify(canvas);
    if (!guard.success) {
      this.ayshPeula("error", { code: "WEBGL_FAIL", message: guard.reason });
      return;
    }
    ContextMonitor.bind(canvas, this);
    try {
      this.renderer = RendererFactory.manifest(canvas);
      const optimizedRatio = resolvePixelRatio({
        raw: devicePixelRatio,
        width: this.width || 1024,
        height: this.height || 768,
        phase: "initial"
      });
      canvas.width = Math.max(1, Math.floor((this.width || 1024) * optimizedRatio));
      canvas.height = Math.max(1, Math.floor((this.height || 768) * optimizedRatio));
      this.renderer.setPixelRatio(optimizedRatio);
      this.ayshPeula("canvased");
    } catch (err) {
      const message = err?.message || String(err);
      console.error("B\"H - RENDERER_BIRTH_FAILURE:", message);
      this.ayshPeula("error", { code: "RENDERER_FAIL", message });
    }
  }

  /** Sizes the renderer and camera. */
  async setSize(vOrWidth = {}, height) {
    const input = typeof vOrWidth === "number" ? { width: vOrWidth, height } : vOrWidth;
    const sizing = ViewportSizer.calculate({ width: input.width, height: input.height });
    this.width = sizing.newWidth;
    this.height = sizing.newHeight;
    if (!this.renderer) return;
    this.renderer.setSize(this.width, this.height, false);
    const ratio = this.renderer.getPixelRatio?.() || 1;
    const targetWidth = Math.max(1, Math.floor(this.width * ratio));
    const targetHeight = Math.max(1, Math.floor(this.height * ratio));
    if (this.renderer.domElement) {
      this.renderer.domElement.width = targetWidth;
      this.renderer.domElement.height = targetHeight;
    }
    this.refreshCameraAspect?.();
    await UIRectifier.rectify(this, this.width, this.height);
  }
}
