
// B"H
/**
 * @file resizeHandler.js
 * @brief Ensures the viewport mathematically aligns with the physical screen reality.
 */
import { manageScene } from '../sceneManager.js';

export function handleResize(renderer) {
    const resized = manageScene.onWindowResize(renderer);
    if (resized) {
        if (renderer.camera) { 
            renderer.camera.state.setAspect(renderer.canvas.width, renderer.canvas.height); 
            renderer.camera.update(); 
        }
        if (renderer.systemManager && renderer.systemManager.postProcessingSystem) { 
            renderer.systemManager.postProcessingSystem.onResize(renderer.canvas.width, renderer.canvas.height); 
        }
    }
}
