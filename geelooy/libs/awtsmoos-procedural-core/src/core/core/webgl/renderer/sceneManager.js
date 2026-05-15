
// B"H
/**
 * @file sceneManager.js
 * @brief Manages loading scenes and high-level renderer state by delegating to specialized modules.
 */
import { configureScene } from './sceneConfigurator.js';
import { updateRendererState } from './stateManager.js';

function loadScene(renderer, sceneData, orbitControls) {
    console.log('B"H - SceneManager: Loading scene...');
    configureScene(renderer, sceneData, orbitControls);
    console.log('B"H - SceneManager: Scene loaded and systems configured.');
}

function setShadowsEnabled(renderer, enabled) {
    updateRendererState.setShadowsEnabled(renderer, enabled);
}

function setWireframesEnabled(renderer, enabled) {
    updateRendererState.setWireframesEnabled(renderer, enabled);
}

// B"H - Restored the missing link
function setSkeletonEnabled(renderer, enabled) {
    console.log(`B"H - SceneManager: Setting Skeleton Visibility to ${enabled}`);
    updateRendererState.setSkeletonEnabled(renderer, enabled);
}

function onWindowResize(renderer) {
    return updateRendererState.onWindowResize(renderer);
}

export const manageScene = {
    loadScene,
    setShadowsEnabled,
    setWireframesEnabled,
    setSkeletonEnabled, 
    onWindowResize
};
