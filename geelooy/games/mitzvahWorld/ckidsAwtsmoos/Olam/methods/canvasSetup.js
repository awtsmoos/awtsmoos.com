
/**
 * B"H
 * @module MasterCanvasSetup
 * @description
 * 📐 CHAPTER 26: THE PROPORTIONS OF REALITY 📐
 */

import WebGLGuard from "./canvas/WebGLGuard.js";
import RendererFactory from "./canvas/RendererFactory.js";
import ViewportSizer from "./canvas/ViewportSizer.js";
import ContextMonitor from "./canvas/ContextMonitor.js";
import UIRectifier from "./ui/UIRectifier.js";

export default class MasterCanvasSetup {
    /** 
     * @function takeInCanvas
     */
    takeInCanvas(canvas, devicePixelRatio = 1) {
        // B"H: silent

        
        const guard = WebGLGuard.verify(canvas);
        if (!guard.success) {
            this.ayshPeula("error", { code: "WEBGL_FAIL", message: guard.reason });
            return;
        }

        ContextMonitor.bind(canvas, this);

        try {
            this.renderer = RendererFactory.manifest(canvas);
            
            /**
             * B"H: THE PERFORMANCE CAPPING
             * Most eyes cannot distinguish beyond 2x pixel density. 
             * Capping at 2.0 significantly increases FPS on high-res mobiles.
             */
            const optimizedRatio = Math.min(devicePixelRatio || 1, 2.0);
            this.renderer.setPixelRatio(optimizedRatio);
            
            // B"H: silent

            this.ayshPeula("canvased");
        } catch (err) {
            console.error("B\"H - 🚨 RENDERER BIRTH FAILURE:", err.message);
            this.ayshPeula("error", { code: "RENDERER_FAIL", message: err.message });
        }
    }

    /** 
     * @function setSize
     */
    async setSize(vOrWidth = {}, height) {
        let w, h;
        if (typeof vOrWidth === "number") {
            w = vOrWidth; h = height;
        } else {
            w = vOrWidth.width; h = vOrWidth.height;
        }

        const sizing = ViewportSizer.calculate({ width: w, height: h });
        this.width = sizing.newWidth;
        this.height = sizing.newHeight;

        if (this.renderer) {
            this.renderer.setSize(this.width, this.height, false);
            if (this.refreshCameraAspect) this.refreshCameraAspect();
            await UIRectifier.rectify(this, this.width, this.height);
        }
    }
}
