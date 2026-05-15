
// B"H
/**
 * @file systemInit.js
 * @brief The spark that ignites the managers of existence.
 */

import { ProgramManager } from '../managers/programManager.js';
import { SystemManager } from '../managers/systemManager.js';
import { DrawingManager } from '../managers/drawingManager.js';
import { AnimationManager } from '../../../animation/animationManager.js';
import { InputManager } from '../../../../input/inputManager.js';
import { PlayerController } from '../../../../input/playerController.js';

/**
 * @brief Bootstraps all interconnected systems required for the WebGL engine.
 * @param {object} renderer - The parent renderer instance.
 */
export function initializeSystems(renderer) {
    const gl = renderer.gl;

    renderer.programManager = new ProgramManager(gl);
    renderer.programManager.init();
    
    renderer.systemManager = new SystemManager(renderer);
    renderer.systemManager.init();

    renderer.drawingManager = new DrawingManager(renderer);
    renderer.animationManager = new AnimationManager();
    
    renderer.inputManager = new InputManager();
    renderer.playerController = new PlayerController(renderer, renderer.inputManager);
}
