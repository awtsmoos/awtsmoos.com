// B"H
/**
 * @module MasterCanvasSetup
 * @description Chapter 12: Quiet bh17 canvas setup.
 */
import WebGLGuard from "./canvas/WebGLGuard.js";
import RendererFactory from "./canvas/RendererFactory.js?v=lean-l1-20260528-bh17";
import ViewportSizer from "./canvas/ViewportSizer.js";
import ContextMonitor from "./canvas/ContextMonitor.js";
import UIRectifier from "./ui/UIRectifier.js";
import { resolvePixelRatio } from "../../divine_systems/render/core/PixelRatioGovernor.js";

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
    this.refreshCameraAspect?.();
    await UIRectifier.rectify(this, this.width, this.height);
  }
}
