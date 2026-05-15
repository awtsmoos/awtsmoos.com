
// B"H
/** 
 * @file mainPass.js 
 * @brief The Master Passage of Manifestation.
 */
import { mat4_core } from '../../../math/mat4/core.js'; 
import { GrassMaterial } from '../../materials/grassMaterial.js';
import { ReflectiveMaterial } from '../../materials/reflectiveMaterial.js';
import { WaterMaterial } from '../../materials/waterMaterial.js'; 
import { OceanMaterial } from '../../materials/ocean/index.js'; 
import { drawSceneGraph } from './sceneGraphDrawer.js';

let materialInstances = {};

export function drawMainPass(renderer, lightDir, globalShaderVars) {
    const gl = renderer.gl;

    // B"H - BULLETPROOF SAFETY: Ensure the canvas is ready for solid reality.
    // This forcibly prevents any rogue additive blending from previous passes.
    gl.disable(gl.BLEND);
    gl.depthMask(true);
    gl.enable(gl.DEPTH_TEST);

    if (!materialInstances.grass && renderer.programManager.grassProgramInfo) {
        materialInstances.grass = new GrassMaterial(gl);
        materialInstances.grass.setProgram(renderer.programManager.grassProgramInfo);
    }
    if (!materialInstances.reflective && renderer.programManager.reflectiveProgramInfo) {
        materialInstances.reflective = new ReflectiveMaterial(gl);
        materialInstances.reflective.setProgram(renderer.programManager.reflectiveProgramInfo);
    }
    if (!materialInstances.water && renderer.programManager.waterProgramInfo) {
        materialInstances.water = new WaterMaterial(gl);
        materialInstances.water.setProgram(renderer.programManager.waterProgramInfo);
    }
    if (!materialInstances.ocean && renderer.programManager.oceanProgramInfo) {
        materialInstances.ocean = new OceanMaterial(gl);
        materialInstances.ocean.setProgram(renderer.programManager.oceanProgramInfo);
    }

    renderer.camera.state.setAspect(gl.canvas.clientWidth, gl.canvas.clientHeight);
    renderer.camera.update();
    
    const projectionMatrix = renderer.camera.getProjection();
    const viewMatrix = renderer.camera.getView();
    
    let invView = mat4_core.identity();
    let cameraPos = [0, 0, 0];
    if (mat4_core.inverse(invView, viewMatrix)) {
        cameraPos =[invView[12], invView[13], invView[14]];
    } else {
        const s = renderer.camera.state;
        cameraPos = [
            s.target[0] + s.radius * Math.cos(s.beta) * Math.sin(s.alpha),
            s.target[1] + s.radius * Math.sin(s.beta),
            s.target[2] + s.radius * Math.cos(s.beta) * Math.cos(s.alpha)
        ];
    }

    drawSceneGraph(renderer, projectionMatrix, viewMatrix, cameraPos, lightDir, globalShaderVars);
}
