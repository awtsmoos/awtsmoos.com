
// B"H
/**
 * @file flareRenderer.js
 * @brief Manifests the dazzling radiance of the celestial light source, enforcing strict occlusion.
 * 
 * THE PSALM OF THE CONCEALED RADIANCE:
 * The Light of the Ein Sof fills all empty space,
 * Until a vessel of matter dares to show its face!
 * We cast a ray from the eye to the burning sun,
 * And check every object until the math is done.
 * If the distance is breached, if the boundary is crossed,
 * The Flare fades away, in the shadow it's lost.
 * For the Awtsmoos honors the limits He made,
 * Allowing the Golem to stand in the shade!
 * 
 * @class FlareRenderer
 * @classdesc Renders a procedural screen-space lens flare with depth-agnostic raycast occlusion.
 */

import { mat4_core } from '../../../../math/mat4/core.js';
import { Vec3 } from '../../../../math/vec3.js';
import { compileShaderProgram } from '../../../shaderCompiler.js';
import { VS_FLARE, FS_FLARE } from './flareShaders.js';

export class FlareRenderer {
    /**
     * @param {WebGLRenderingContext} gl - The sacred context.
     */
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.buffer = null;
        this.renderer = null; 
        this.fadeState = 1.0; 
    }

    /**
     * B"H
     * Prepares the buffers and compiles the flare shaders.
     * @param {Object} renderer - The master renderer.
     */
    init(renderer) {
        this.renderer = renderer;
        const gl = this.gl;
        const progInfo = compileShaderProgram(gl, VS_FLARE, FS_FLARE);
        if (progInfo) this.program = progInfo.program;

        // A full-screen quad to catch the procedural light
        const verts = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
        this.buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        gl.bufferData(gl.ARRAY_BUFFER, verts, gl.STATIC_DRAW);
    }

    /**
     * B"H
     * Draws the flare, fading it out if any vessel obstructs the line of sight.
     */
    draw(viewMatrix, projectionMatrix, lightDir, globalVars, cameraPos, allObjects, renderer) {
        if (!this.program || !renderer) return;
        const gl = this.gl;

        let occluded = false;
        
        // 1. THE TZIMTZUM RAYCAST (UNIVERSAL OCCLUSION)
        // We cast a ray from the Eye (Camera) towards the Light Source.
        const rayOrigin = cameraPos;
        const rayDir = lightDir; 

        /**
         * B"H - Recursive checker for all geometric vessels.
         */
        const checkOcclusionRecursive = (obj) => {
            if (occluded || obj.visible === false) return;
            
            // Get the current dynamic position of this specific object
            const currentTime = (performance.now() - renderer.startTime) / 1000;
            const mat = renderer.animationManager.getInterpolatedTransform(obj.id, currentTime);
            const objPos = [mat[12], mat[13], mat[14]];

            // Vector from Camera to Object
            const L = Vec3.sub(objPos, rayOrigin);
            
            // Projection of L onto the Ray Direction
            const tca = Vec3.dot(L, rayDir);

            // If the object is IN FRONT of the camera (tca > 0)
            if (tca > 0) {
                // Calculate closest distance from object center to the ray
                const d2 = Vec3.dot(L, L) - (tca * tca);
                
                // Determine a rough bounding radius based on parameters
                let r = 1.0; 
                if (obj.parameters) {
                    if (obj.parameters.size) r = obj.parameters.size * 0.8;
                    else if (obj.parameters.radius) r = obj.parameters.radius;
                }
                
                // If the ray pierces the bounding sphere, the sun is blocked!
                if (d2 < (r * r)) {
                    occluded = true;
                }
            }

            // Traverse children hierarchically
            if (obj.children) obj.children.forEach(checkOcclusionRecursive);
        };

        // Execute the check against all creation
        if (allObjects) {
            allObjects.forEach(checkOcclusionRecursive);
        }

        // 2. SMOOTH FADING LOGIC
        // If blocked, fade out quickly. If clear, fade in gently.
        this.fadeState += (occluded ? -0.15 : 0.05);
        this.fadeState = Math.max(0.0, Math.min(1.0, this.fadeState));

        if (this.fadeState <= 0.0) return; // Completely hidden in shadow

        // 3. SCREEN PROJECTION MATH
        const viewProj = mat4_core.identity();
        mat4_core.multiply(viewProj, projectionMatrix, viewMatrix);
        
        // Place the sun far, far away along the light direction vector
        const sunWorldPos = [lightDir[0] * 100000.0, lightDir[1] * 100000.0, lightDir[2] * 100000.0];
        
        const m = viewProj;
        const x = sunWorldPos[0], y = sunWorldPos[1], z = sunWorldPos[2];
        let w = m[3] * x + m[7] * y + m[11] * z + m[15];
        w = w || 1.0;

        // If the sun is behind the camera plane, do not render
        const onScreen = w > 0.0 ? 1.0 : 0.0;
        
        const screenPos = [
            ((m[0] * x + m[4] * y + m[8] * z + m[12]) / w) * 0.5 + 0.5,
            ((m[1] * x + m[5] * y + m[9] * z + m[13]) / w) * 0.5 + 0.5,
            onScreen
        ];

        // 4. THE MANIFESTATION COMMAND
        gl.useProgram(this.program);
        
        // ADDITIVE BLENDING: The light compounds upon the existing scene
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.ONE, gl.ONE);
        gl.disable(gl.DEPTH_TEST);

        gl.uniform3fv(gl.getUniformLocation(this.program, 'uSunScreenPos'), screenPos);
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uSunDir'), lightDir);
        gl.uniform2fv(gl.getUniformLocation(this.program, 'uResolution'), [gl.canvas.width, gl.canvas.height]);
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);
        
        const baseIntensity = globalVars.uSunIntensity !== undefined ? globalVars.uSunIntensity : 1.0;
        gl.uniform1f(gl.getUniformLocation(this.program, 'uSunIntensity'), baseIntensity * this.fadeState);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.buffer);
        const loc = gl.getAttribLocation(this.program, 'aVertexPosition');
        gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(loc);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

        // 5. RESTORE THE LAWS OF NATURE
        gl.enable(gl.DEPTH_TEST);
        gl.disable(gl.BLEND);
    }
}
