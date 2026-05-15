
// B"H
/**
 * @file drawSkeleton.js
 * @brief Pierces the visual flesh! Forces the Skeleton to draw over absolutely everything.
 */
import { mat4_core } from '../../../math/mat4/core.js';
import { Vec3 } from '../../../math/vec3.js';
import { setupObjectBuffers } from '../../bufferCreator.js';
import { createBoneBasisMatrix } from './boneMath.js';
import { createBoneMesh } from '../../../geometry/primitives/bone.js';
import { meshToRenderData } from '../../../geometry/utils/meshData.js';

let cachedBoneBuffers = null;

export function drawSkeleton(context, obj, lambertInstance, wireframeInstance) {
    const { renderer, projectionMatrix, viewMatrix, worldModelMatrix } = context;
    const { gl, animationManager, currentTime } = renderer;
    const skeleton = obj.skeletonInstance;

    if (!skeleton) return;

    if (!cachedBoneBuffers) {
        // Broadened width for clear visibility
        const rawBone = createBoneMesh({ color:[0.0, 1.0, 1.0, 1.0], width: 0.25 }); 
        const data = meshToRenderData(rawBone);
        cachedBoneBuffers = setupObjectBuffers(gl, data, 'global_skeletal_ghost');
    }
    
    // Update poses
    animationManager.updateSkeleton(skeleton, obj.id, currentTime);
    skeleton.updateWorldMatrices(worldModelMatrix);

    // B"H - OVERRIDE REALITY. Draw regardless of depth!
    gl.depthFunc(gl.ALWAYS);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE); 

    const renderBones = (mat) => {
        if (!mat) return;
        gl.useProgram(mat.program);
        gl.uniformMatrix4fv(gl.getUniformLocation(mat.program, 'uProjectionMatrix'), false, projectionMatrix);
        
        const mvLoc = gl.getUniformLocation(mat.program, 'uModelViewMatrix');
        const uIsWire = gl.getUniformLocation(mat.program, 'uIsWireframe');
        if (uIsWire) gl.uniform1f(uIsWire, 1.0); 
        
        const uCol = gl.getUniformLocation(mat.program, 'uColor');
        if (uCol) gl.uniform4fv(uCol,[0.0, 1.0, 1.0, 1.0]); // Brilliant Cyan Glow

        const aPos = gl.getAttribLocation(mat.program, 'aVertexPosition');
        gl.bindBuffer(gl.ARRAY_BUFFER, cachedBoneBuffers.position);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(aPos);

        skeleton.bones.forEach(bone => {
            const worldP =[bone.worldMatrix[12], bone.worldMatrix[13], bone.worldMatrix[14]];
            
            let targets =[];
            if (bone.children.length > 0) {
                targets = bone.children.map(c => [c.worldMatrix[12], c.worldMatrix[13], c.worldMatrix[14]]);
            } else {
                // Ensure hands/head have a visible vector pointing outward!
                const yAxis = [bone.worldMatrix[4], bone.worldMatrix[5], bone.worldMatrix[6]];
                targets.push(Vec3.add(worldP, Vec3.scale(Vec3.normalize(yAxis), 0.5))); 
            }

            targets.forEach(tPos => {
                const dir = Vec3.sub(tPos, worldP);
                const dist = Vec3.dist(worldP, tPos);
                const safeDist = Math.max(dist, 0.05); // Prevent scale = 0 collapse

                const localMat = createBoneBasisMatrix(worldP, dir, safeDist);
                const finalMV = mat4_core.identity();
                mat4_core.multiply(finalMV, viewMatrix, localMat);
                
                gl.uniformMatrix4fv(mvLoc, false, finalMV);

                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cachedBoneBuffers.wireframeIndices);
                // Draw bold thick wireframes bridging the joints
                gl.drawElements(gl.LINES, cachedBoneBuffers.wireframeIndicesCount, gl.UNSIGNED_SHORT, 0);
            });
        });
    };

    renderBones(wireframeInstance);

    // B"H - Restore Reality limits
    gl.depthFunc(gl.LEQUAL);
    gl.disable(gl.BLEND);
}
