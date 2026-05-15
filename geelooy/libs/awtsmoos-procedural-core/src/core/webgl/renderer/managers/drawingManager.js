
// B"H
/**
 * @file drawingManager.js
 * @brief Master orchestrator of the frame rendering cycle.
 */
import { drawShadowPass } from '../passes/shadowPass.js';
import { drawMainPass } from '../passes/mainPass.js';
import { drawHighlightPass } from '../passes/highlightPass.js';
import { Coordinates } from '../../../math/coordinates.js';
import { mat4_core } from '../../../math/mat4/core.js';

export class DrawingManager {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
    }

    renderFrame() {
        const r = this.renderer;
        const gl = this.gl;
        if (!gl) return;

        try {
            r.camera.state.setAspect(gl.canvas.clientWidth, gl.canvas.clientHeight);
            r.camera.update();

            let invView = mat4_core.identity();
            let cameraPos = [0, 0, 0];
            if (mat4_core.inverse(invView, r.camera.getView())) {
                cameraPos = [invView[12], invView[13], invView[14]];
            }

            const globalVars = r.sceneParser ? { ...r.sceneParser.globalShaderVars } : {};
            if (window.__COSMOS_STATE__) {
                const st = window.__COSMOS_STATE__;
                const sunVec = Coordinates.sphericalToVector(st.sunLat, st.sunLon);
                const dRad = (st.ninthSphereRot * Math.PI) / 180.0;
                const c9 = Math.cos(dRad), s9 = Math.sin(dRad);
                globalVars.uLightDirection = [sunVec[0]*c9 - sunVec[1]*s9, sunVec[0]*s9 + sunVec[1]*c9, sunVec[2]];
                globalVars.uSunIntensity = Math.max(0.1, Math.min(1.0, st.sunIntensity || 0.6));
            }
            
            let lightDir = globalVars.uLightDirection || [0.5, 1.0, 0.5];

            // 1. SHADOW PASS - FOLLOW THE CAMERA TARGET!
            if (r.shadowsEnabled && r.systemManager.shadowSystem) {
                // B"H - Passing the target ensures shadows match reality even when far from origin.
                r.systemManager.shadowSystem.updateLightMatrix(lightDir, r.camera.state.target);
                drawShadowPass(r, lightDir);
            }

            // 2. DIRECT SCREEN MANIFESTATION
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
            
            gl.clearColor(0.4, 0.6, 0.9, 1.0); 
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

            // 3. DRAW THE HEAVENS
            if (r.systemManager.skySystem) {
                r.systemManager.skySystem.draw(r.camera.getView(), r.camera.getProjection(), lightDir, globalVars, cameraPos);
            }

            // 4. DRAW THE EARTH AND VESSELS
            drawMainPass(r, lightDir, globalVars);

            // 5. LENS FLARE
            if (r.systemManager.flareSystem) {
                r.systemManager.flareSystem.draw(
                    r.camera.getView(), r.camera.getProjection(), lightDir, globalVars, cameraPos, r.rootAnimatedObjects, r
                );
            }

            // 6. HIGHLIGHT AND GIZMO
            const selectedObj = window.__SELECTED_OBJECT__;
            if (selectedObj && selectedObj.selectable) {
                drawHighlightPass(r, selectedObj, r.camera.getProjection(), r.camera.getView());
                if (r.systemManager.gizmoSystem) {
                    r.systemManager.gizmoSystem.draw(r.camera.getView(), r.camera.getProjection(), selectedObj);
                }
            }

        } catch (err) {
            console.error('B"H - 🚨 [DrawingManager]: Fatal frame crash!', err);
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        }
    }
}
