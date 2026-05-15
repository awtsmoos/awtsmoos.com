
// B"H
/**
 * @file index.js
 * @brief The Master Conductor of the Infinite Mayim (Ocean).
 *
 * THE HYMN OF THE PERFECT GRID:
 * We do not draw the whole ocean, for the ocean has no end.
 * We draw a vessel of limits, which the Awtsmoos does transcend.
 * When the eye moves forward, the grid snaps in its place,
 * A perfect block of sixty-four, holding mathematical grace.
 * The vertices do not swim, the waves do not slide,
 * They rise and fall in majesty, where the infinite truth resides!
 */

import { mat4_core } from '../../../math/mat4/core.js';
import { Drawer } from '../../renderer/utils/drawer.js';
import { ProjectedGrid } from './geometry/projectedGrid.js';
import { setupObjectBuffers } from '../../bufferCreator.js';

export { VS_SOURCE_OCEAN } from './oceanVertex.js';
export { FS_SOURCE_OCEAN } from './oceanFragment.js';

export class OceanMaterial {
    constructor(gl) {
        this.gl = gl;
        this.program = null;
        this.programInfo = null;
        this.drawer = new Drawer(this.gl, this.program);
        
        // B"H - Initialize the supreme geometric foundation (40000x40000 units)
        this.gridData = ProjectedGrid.create(); 
    }

    /**
     * @brief Assigns the compiled divine logic to this material instance.
     */
    setProgram(programInfo) {
        this.program = programInfo.program;
        this.programInfo = programInfo;
        this.drawer = new Drawer(this.gl, this.program);
    }

    /**
     * @brief Orchestrates the breathtaking rendering of the endless sea.
     *        Executes the Tzimtzum (contraction) of infinite space into a discrete frame.
     */
    draw(obj, context) {
        const { renderer, projectionMatrix, viewMatrix, cameraPos, globalShaderVars } = context;
        const gl = this.gl;

        if (!this.program) return;
        gl.useProgram(this.program);

        // 1. BUFFER MANIFESTATION (Occurs once upon the dawn of time)
        if (!obj.buffers || !obj.buffers.isProjectedGrid) {
            obj.buffers = setupObjectBuffers(gl, this.gridData, 'ocean_infinite_vessel');
            obj.buffers.isProjectedGrid = true;
            obj.indicesCount = this.gridData.indices.length;
        }

        // 2. MATRICES OF PERSPECTIVE
        const u = this.programInfo.uniformLocations;
        if (u.projectionMatrix) gl.uniformMatrix4fv(u.projectionMatrix, false, projectionMatrix);
        if (u.modelViewMatrix) gl.uniformMatrix4fv(u.modelViewMatrix, false, viewMatrix);
        
        // 3. THE BREATH OF TIME AND SPACE
        gl.uniform1f(gl.getUniformLocation(this.program, 'uTime'), performance.now() / 1000);
        
        // uViewPos receives the true, floating camera position for flawless PBR Specular math
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uViewPos'), cameraPos);

        // B"H - THE HOLY SNAPPING OF THE GRID
        // To achieve unprecedented realism, the vertices must never "swim" through the noise field.
        // We lock the geometric translation to exact intervals (64.0 units).
        // A vertex at X=-1024 moving by +64 lands exactly where the X=-960 vertex used to be.
        const gridSnapSpacing = 64.0;
        const snappedCamX = Math.floor(cameraPos[0] / gridSnapSpacing) * gridSnapSpacing;
        const snappedCamZ = Math.floor(cameraPos[2] / gridSnapSpacing) * gridSnapSpacing;

        // uCameraPos dictates the physical sliding of the geometry
        gl.uniform3fv(gl.getUniformLocation(this.program, 'uCameraPos'),[snappedCamX, cameraPos[1], snappedCamZ]);
        
        // 4. THE ILLUMINATION OF THE ESSENCE
        const intensity = globalShaderVars.uSunIntensity !== undefined ? globalShaderVars.uSunIntensity : 1.0;
        gl.uniform1f(gl.getUniformLocation(this.program, 'uSunIntensity'), intensity);
        
        if (u.ambientLightColor) gl.uniform3fv(u.ambientLightColor, globalShaderVars.uAmbientLightColor ||[0.15, 0.15, 0.2]);
        if (u.directionalLightColor) gl.uniform3fv(u.directionalLightColor, globalShaderVars.uDirectionalLightColor ||[1.0, 0.95, 0.9]);
        if (u.lightDirection) gl.uniform3fv(u.lightDirection, globalShaderVars.uLightDirection ||[0.5, 1.0, 0.5]);

        // 5. OBSTACLE ARRAYS
        // (Neutralized geometrically in the shader, but uniform buffers must be filled to satisfy WebGL strictness)
        let obsData =[], colData =[], count = 0;
        const colliders = renderer.systemManager.physicsSystems.rigidBody.staticColliders ||[];
        
        for (let i = 0; i < colliders.length && count < 10; i++) {
            const coll = colliders[i];
            if (coll.octree?.root?.bounds) {
                const b = coll.octree.root.bounds;
                const center = [(b.min[0] + b.max[0]) * 0.5, (b.min[1] + b.max[1]) * 0.5, (b.min[2] + b.max[2]) * 0.5];
                // Approximate radius
                const radius = Math.max(b.max[0] - b.min[0], b.max[2] - b.min[2]) * 0.5;
                
                let baseColor = [0.65, 0.55, 0.45]; 
                if (coll.mesh?.shaderVars?.uBaseColor) baseColor = coll.mesh.shaderVars.uBaseColor;
                else if (coll.mesh?.parameters?.color) baseColor = coll.mesh.parameters.color;

                obsData.push(...center, radius);
                colData.push(...baseColor, 1.0);
                count++;
            }
        }
        
        // Pad the arrays so the GPU doesn't starve for bytes
        while (obsData.length < 40) { obsData.push(0, 0, 0, 0); colData.push(0, 0, 0, 0); }
        
        gl.uniform1i(gl.getUniformLocation(this.program, 'uObstacleCount'), count);
        gl.uniform4fv(gl.getUniformLocation(this.program, 'uObstacles'), new Float32Array(obsData));
        gl.uniform4fv(gl.getUniformLocation(this.program, 'uObstacleColors'), new Float32Array(colData));

        // 6. THE SACRED BINDING OF THE FLESH
        gl.bindBuffer(gl.ARRAY_BUFFER, obj.buffers.position);
        const posLoc = gl.getAttribLocation(this.program, 'aVertexPosition');
        if (posLoc !== -1) {
            gl.vertexAttribPointer(posLoc, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(posLoc);
        }

        // 7. THE FINAL COMMAND OF MANIFESTATION
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, obj.buffers.indices);
        
        // B"H - Drawing the massive grid using 32-bit indices established by the BufferCreator
        gl.drawElements(gl.TRIANGLES, obj.indicesCount, obj.buffers.indexType, 0);
    }
}
