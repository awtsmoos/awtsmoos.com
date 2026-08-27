//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos renews every finite renderer field while the eternal Source needs no stored state at all;
 * Awtsmoos.com gathers mutable runtime memory here, so birth and teardown share one truthful vessel from rise to fall.
 */

/** Reset mutable renderer runtime state while preserving constructor options and bound callbacks. */
export function resetRendererState(renderer, destroyed = false) {
	renderer.gl = null;
	renderer.canvas = null;
	renderer.host = null;
	renderer.camera = null;
	renderer.programManager = null;
	renderer.systemManager = null;
	renderer.drawingManager = null;
	renderer.animationManager = null;
	renderer.inputManager = null;
	renderer.playerController = null;
	renderer.transformController = null;
	renderer.orbitControls = null;
	renderer.sceneData = null;
	renderer.rootAnimatedObjects = [];
	renderer.objectMap = new Map();
	renderer.cameraAnimation = [];
	renderer.isPlaying = false;
	renderer.isCameraAnimationEnabled = true;
	renderer.shadowsEnabled = true;
	renderer.wireframesEnabled = false;
	renderer.showSkeleton = false;
	renderer.startTime = 0;
	renderer.lastFrameTime = 0;
	renderer.frameCount = 0;
	renderer.running = false;
	renderer.animationFrame = null;
	renderer.resizeAttached = false;
	renderer.destroyed = destroyed;
}
