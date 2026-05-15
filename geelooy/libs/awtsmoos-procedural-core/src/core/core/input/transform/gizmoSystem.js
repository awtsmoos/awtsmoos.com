
// B"H
/**
 * @file gizmoSystem.js
 * @brief Renders the Transform Gizmo arrows over the selected object.
 */
import { GizmoGeometry } from './gizmoGeometry.js';
import { mat4_core } from '../../math/mat4/core.js';
import { mat4_transformations } from '../../math/mat4/transformations.js';

export class GizmoSystem {
    constructor(renderer) {
        this.renderer = renderer;
        this.gl = renderer.gl;
        this.buffers = null;
    }

    init() {
        this.buffers = GizmoGeometry.build(this.gl);
    }

    draw(viewMatrix, projectionMatrix, selectedObject) {
        if (!selectedObject || !selectedObject.draggable || !this.buffers) return;

        const gl = this.gl;
        const progInfo = this.renderer.programManager.lambertProgramInfo;
        if (!progInfo) return;

        const pos = selectedObject.keyframes[0].position;

        const worldModel = mat4_core.identity();
        mat4_transformations.translate(worldModel, pos);
        const modelView = mat4_core.identity();
        mat4_core.multiply(modelView, viewMatrix, worldModel);
        const normalMatrix = mat4_core.identity();

        gl.useProgram(progInfo.program);
        gl.disable(gl.DEPTH_TEST); 

        const u = progInfo.uniformLocations;
        gl.uniformMatrix4fv(u.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(u.modelViewMatrix, false, modelView);
        gl.uniformMatrix4fv(gl.getUniformLocation(progInfo.program, 'uModelMatrix'), false, worldModel);
        gl.uniformMatrix4fv(u.normalMatrix, false, normalMatrix);
        gl.uniform3fv(u.ambientLightColor, [1, 1, 1]);
        gl.uniform3fv(u.directionalLightColor, [0, 0, 0]);
        gl.uniform1f(gl.getUniformLocation(progInfo.program, 'uIsWireframe'), 0.0);
        gl.uniform1f(gl.getUniformLocation(progInfo.program, 'uUseTexture'), 0.0);

        const a = progInfo.attribLocations;

        const drawBuffers = (b, count) => {
            gl.bindBuffer(gl.ARRAY_BUFFER, b.position);
            gl.vertexAttribPointer(a.vertexPosition, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a.vertexPosition);
            gl.bindBuffer(gl.ARRAY_BUFFER, b.color);
            gl.vertexAttribPointer(a.vertexColor, 4, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a.vertexColor);
            gl.bindBuffer(gl.ARRAY_BUFFER, b.normal);
            gl.vertexAttribPointer(a.vertexNormal, 3, gl.FLOAT, false, 0, 0);
            gl.enableVertexAttribArray(a.vertexNormal);
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, b.indices);
            gl.drawElements(gl.TRIANGLES, count, gl.UNSIGNED_SHORT, 0);
        };

        ['x', 'y', 'z'].forEach(axis => {
            drawBuffers(this.buffers[axis].shaft, this.buffers[axis].counts.shaft);
            drawBuffers(this.buffers[axis].head, this.buffers[axis].counts.head);
        });
        drawBuffers(this.buffers.center, this.buffers.centerCount);

        gl.enable(gl.DEPTH_TEST);
    }
}
