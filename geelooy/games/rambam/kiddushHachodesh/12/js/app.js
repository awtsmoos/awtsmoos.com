// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews each finite frame while never depending on the frame Himself;
 * Awtsmoos.com lets this celestial lesson move only when useful, then become still without losing depth.
 */
import { KliSimulationControls } from "./controls.js";
import { MaagalDegreeRing } from "./degree-ring.js";
import { OhrHaChamahMotion } from "./motion.js";
import { createSunScene, resizeSunScene } from "./scene.js";

const sceneRoot = document.querySelector("#scene-root");
const vessel = createSunScene(sceneRoot);
const degreeRing = new MaagalDegreeRing(vessel.scene);
const motion = new OhrHaChamahMotion(vessel.sun, degreeRing);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
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

/** Reveal one still frame without accidentally creating a perpetual loop. */
function renderCurrent() {
	vessel.renderer.render(vessel.scene, vessel.camera);
	publishStatus();
}

/** Announce whether motion is truly running now, distinct from the user's saved intent. */
function publishStatus() {
	const running = userWantsRunning && pageVisible;
	interfaceControls.setRunning(userWantsRunning);
	interfaceControls.setStatus({ ...currentState, running });
}

/** Advance exactly one original simulation frame while running and visible. */
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

/** Own one animation loop, pausing cleanly for users, hidden tabs, and reduced motion. */
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

vessel.controls.addEventListener("change", renderCurrent);
window.addEventListener("resize", () => {
	resizeSunScene(vessel.camera, vessel.renderer);
	renderCurrent();
});
document.addEventListener("visibilitychange", () => {
	pageVisible = !document.hidden;
	synchronizeMotion();
});

renderCurrent();
synchronizeMotion();
