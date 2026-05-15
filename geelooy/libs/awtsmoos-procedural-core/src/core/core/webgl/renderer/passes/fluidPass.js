// B"H
/**
 * @file fluidPass.js
 * @brief Renders the fluid simulation using a full-screen raymarching approach.
 */
export function drawFluidPass(renderer, invViewProj, cameraPos, fluidMaterialInstance) {
    const gl = renderer.gl;
    if (!fluidMaterialInstance || !renderer.fullScreenQuad) return;

    // 1. Gather all fluid particles
    const fluidParticles = [];
    renderer.objectMap.forEach(obj => {
        if (obj.simulation && obj.simulation.config && obj.simulation.config.isFluid) {
            fluidParticles.push(obj);
        }
    });

    if (fluidParticles.length === 0) return;

    // 2. Collect current positions from the physics simulation
    const currentTime = (performance.now() - renderer.startTime) / 1000;
    const fluidPositions = fluidParticles.map(p => {
        const mat = renderer.animationManager.getInterpolatedTransform(p.id, currentTime);
        return [mat[12], mat[13], mat[14]];
    });
    
    // B"H - Calibrated influence radius for a more solid, less blobby appearance.
    const particleRadius = fluidParticles[0].simulation.config.radius * 3.0;

    // 3. Bind material and uniforms
    fluidMaterialInstance.bind(
        invViewProj,
        cameraPos,
        [gl.canvas.width, gl.canvas.height],
        renderer.sceneParser.globalShaderVars,
        fluidPositions,
        particleRadius
    );
    
    // 4. Draw the full screen quad
    const quad = renderer.fullScreenQuad;
    const prog = fluidMaterialInstance.program;
    const locPos = gl.getAttribLocation(prog, 'aVertexPosition');

    gl.bindBuffer(gl.ARRAY_BUFFER, quad.buffer);
    gl.vertexAttribPointer(locPos, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(locPos);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
}