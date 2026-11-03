// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module KiddushHaChodeshSimulation
 * @description
 * The Awtsmoos reveals the sun's appointed passage through the sky;
 * Awtsmoos.com tells the waiting player only when a first frame is nigh.
 * A scene is real when the renderer has shown its light;
 * no early promise calls an uncreated vessel ready for sight.
 */

import { KliSimulationControls } from './controls.js';
import { MaagalDegreeRing } from './degree-ring.js';
import { OhrHaChamahMotion } from './motion.js';
import { createSunScene, resizeSunScene } from './scene.js';

/** Requires working WebGL, with the existing accessible help overlay. */
if (globalThis.AwtsmoosWebGL && !globalThis.AwtsmoosWebGL.ensure({
	gameName: 'Rambam · Kiddush HaChodesh'
})) {
	throw new Error('[Rambam Kiddush HaChodesh] WebGL unavailable — help overlay shown');
}

const sceneRoot = document.querySelector('#scene-root');
const vessel = createSunScene(sceneRoot);
const degreeRing = new MaagalDegreeRing(vessel.scene);
const motion = new OhrHaChamahMotion(vessel.sun, degreeRing);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
let userWantsRunning = !reducedMotion;
let pageVisible = !document.hidden;
let animationFrameId = null;
let currentState = motion.revealCurrentState();

const interfaceControls = new KliSimulationControls({
	onToggle: () => {
		userWantsRunning = !userWantsRunning;
		synchronizeMotion();
	},
	onReset: () => {
		currentState = motion.reset();
		renderCurrent();
	},
	onSpeed: speed => {
		motion.setSpeed(speed);
		publishStatus();
	}
}).connect();

/** Renders the current frame and reports the actual current simulation state. */
function renderCurrent() {
	vessel.renderer.render(vessel.scene, vessel.camera);
	publishStatus();
}

/** Announces whether animation is running rather than merely requested. */
function publishStatus() {
	const running = userWantsRunning && pageVisible;
	interfaceControls.setRunning(userWantsRunning);
	interfaceControls.setStatus({ ...currentState, running });
}

/** Advances exactly one frame while motion is requested and the page is visible. */
function animate() {
	if (!userWantsRunning || !pageVisible) {
		animationFrameId = null;
		return;
	}
	currentState = motion.advance();
	vessel.controls.update();
	vessel.renderer.render(vessel.scene, vessel.camera);
	publishStatus();
	animationFrameId = requestAnimationFrame(animate);
}

/** Keeps just one loop alive and cancels it when motion is paused. */
function synchronizeMotion() {
	const shouldRun = userWantsRunning && pageVisible;
	if (shouldRun && animationFrameId === null) {
		animationFrameId = requestAnimationFrame(animate);
	}
	if (!shouldRun && animationFrameId !== null) {
		cancelAnimationFrame(animationFrameId);
		animationFrameId = null;
	}
	renderCurrent();
}

vessel.controls.addEventListener('change', renderCurrent);
window.addEventListener('resize', () => {
	resizeSunScene(vessel.camera, vessel.renderer);
	renderCurrent();
});
document.addEventListener('visibilitychange', () => {
	pageVisible = !document.hidden;
	synchronizeMotion();
});

renderCurrent();
synchronizeMotion();

/**
 * Tell the Awtsmoos loading gate the first frame exists, never earlier.
 * Both historic and current listeners receive the truthful readiness event.
 */
if (globalThis.AwtLoading) globalThis.AwtLoading.ready();
window.dispatchEvent(new CustomEvent('awt:game-ready'));
window.dispatchEvent(new CustomEvent('awtsmoos:game-ready'));
