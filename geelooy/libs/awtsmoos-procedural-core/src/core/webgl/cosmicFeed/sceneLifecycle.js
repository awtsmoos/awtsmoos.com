// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSceneLifecycle
 * @description
 * Context, visibility, and motion are renewed by the Awtsmoos each instant.
 * Awtsmoos.com listens for human preference and verifies it with a quiet fallback.
 */
import { applyMotionPreference } from "./motionPreference.js";

const MOTION_SYNC_INTERVAL = 1000;

/** Binds browser lifecycle signals to one procedural scene. */
export class CosmicSceneLifecycle {
	/** Creates a lifecycle owner around one canonical scene. */
	constructor(scene) {
		this.scene = scene;
		this.started = false;
		this.motionTimer = 0;
		this.motionPreference = globalThis.matchMedia?.(
			"(prefers-reduced-motion: reduce)"
		) || null;
		this.onResize = () => scene.resize();
		this.onScroll = () => scene.setScroll(window.scrollY);
		this.onVisibility = () => scene.setPaused(document.hidden);
		this.onMotionPreference = event => applyMotionPreference(scene, event.matches);
		this.syncMotionPreference = () => {
			if (this.motionPreference) {
				applyMotionPreference(scene, this.motionPreference.matches);
			}
		};
		this.onContextLost = event => {
			event.preventDefault();
			scene.suspendForContextLoss();
		};
		this.onContextRestored = () => scene.restoreContext();
	}

	/** Installs browser observers once. */
	start() {
		if (this.started) {
			return;
		}
		this.started = true;
		window.addEventListener("resize", this.onResize, { passive: true });
		window.addEventListener("scroll", this.onScroll, { passive: true });
		document.addEventListener("visibilitychange", this.onVisibility);
		this.scene.canvas.addEventListener("webglcontextlost", this.onContextLost);
		this.scene.canvas.addEventListener("webglcontextrestored", this.onContextRestored);
		bindMotionPreference(this.motionPreference, this.onMotionPreference);
		this.syncMotionPreference();
		this.motionTimer = globalThis.setInterval?.(
			this.syncMotionPreference,
			MOTION_SYNC_INTERVAL
		) || 0;
	}

	/** Removes every installed observer and preference fallback. */
	destroy() {
		if (!this.started) {
			return;
		}
		this.started = false;
		window.removeEventListener("resize", this.onResize);
		window.removeEventListener("scroll", this.onScroll);
		document.removeEventListener("visibilitychange", this.onVisibility);
		this.scene.canvas.removeEventListener("webglcontextlost", this.onContextLost);
		this.scene.canvas.removeEventListener("webglcontextrestored", this.onContextRestored);
		releaseMotionPreference(this.motionPreference, this.onMotionPreference);
		globalThis.clearInterval?.(this.motionTimer);
		this.motionTimer = 0;
	}
}

function bindMotionPreference(preference, listener) {
	if (preference?.addEventListener) {
		preference.addEventListener("change", listener);
	} else {
		preference?.addListener?.(listener);
	}
}

function releaseMotionPreference(preference, listener) {
	if (preference?.removeEventListener) {
		preference.removeEventListener("change", listener);
	} else {
		preference?.removeListener?.(listener);
	}
}
