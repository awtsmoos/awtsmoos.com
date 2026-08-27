//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos awakens only systems that truly exist while optional embodiment waits for a real vessel to appear;
 * Awtsmoos.com refuses phantom imports, so native rendering can boot cleanly and future capability injection stays sincere and clear.
 */

import { AnimationManager } from "../../../animation/animationManager.js";
import { DrawingManager } from "../managers/drawingManager.js";
import { ProgramManager } from "../managers/programManager.js";
import { SystemManager } from "../managers/systemManager.js";

/** Initialize concrete renderer systems and optional injected embodiment capabilities. */
export function initializeSystems(renderer) {
	const gl = renderer.gl;
	renderer.programManager = new ProgramManager(gl);
	renderer.programManager.init();
	renderer.systemManager = new SystemManager(renderer);
	renderer.systemManager.init();
	renderer.drawingManager = new DrawingManager(renderer);
	renderer.animationManager = new AnimationManager();
	initializeOptionalCapabilities(renderer);
}

function initializeOptionalCapabilities(renderer) {
	const createInputManager = renderer.options.inputManagerFactory;
	const createPlayerController = renderer.options.playerControllerFactory;
	renderer.inputManager = typeof createInputManager === "function"
		? createInputManager(renderer)
		: null;
	renderer.playerController = typeof createPlayerController === "function"
		? createPlayerController(renderer, renderer.inputManager)
		: null;
}
