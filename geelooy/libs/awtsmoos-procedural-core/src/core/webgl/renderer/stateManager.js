
// B"H
/**
 * @file stateManager.js
 * @brief Manages renderer state toggles.
 */
import { resizeCanvas } from './context.js';

function setShadowsEnabled(renderer, enabled) {
    renderer.shadowsEnabled = enabled;
}

function setWireframesEnabled(renderer, enabled) {
    renderer.wireframesEnabled = enabled;
}

function setSkeletonEnabled(renderer, enabled) {
    renderer.showSkeleton = enabled;
}

function onWindowResize(renderer) {
    return resizeCanvas(renderer.gl, renderer.canvas);
}

export const updateRendererState = {
    setShadowsEnabled,
    setWireframesEnabled,
    setSkeletonEnabled, // B"H
    onWindowResize
};
