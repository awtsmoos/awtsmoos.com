
// B"H
/**
 * @file skyPass.js
 * @brief Integration layer for the Sky system in the main pipeline.
 */
import { SkyRenderer } from './sky/skyRenderer.js';

export class SkySystem {
    constructor(gl) {
        this.renderer = new SkyRenderer(gl);
    }

    init() {
        this.renderer.init();
    }

    // B"H - Passing cameraPos down into the Renderer
    draw(viewMatrix, projectionMatrix, lightDir, globalVars, cameraPos) {
        this.renderer.draw(viewMatrix, projectionMatrix, lightDir, globalVars, cameraPos);
    }
}
