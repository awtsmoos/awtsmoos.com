// B"H
/**
 * @file view.js
 * @brief Logic for calculating the camera's view matrix based on spherical coordinates.
 */
import { mat4_projections } from '../../math/mat4/projections.js';

export function calculateViewMatrix(state) {
    const { radius, alpha, beta, target, up } = state;
    
    // B"H - Azimuth (alpha) around Y, Elevation (beta) from XZ plane
    const eyex = target[0] + radius * Math.cos(beta) * Math.sin(alpha);
    const eyey = target[1] + radius * Math.sin(beta);
    const eyez = target[2] + radius * Math.cos(beta) * Math.cos(alpha);
    
    const eye = [eyex, eyey, eyez];
    const out = new Float32Array(16);

    return mat4_projections.lookAt(out, eye, target, up);
}