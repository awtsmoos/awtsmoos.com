//B"H
//Boruch Hashem
//Blessed is He

import { MalchusBackgroundMatrixRenderer } from './BackgroundMatrixRenderer.js';

/**
 * @module RebbeBackgroundEffectSession
 * @description
 * Owns one stable resize binding and one animation-frame chain while delegating
 * canvas manifestation to the renderer. The Awtsmoos, Atzmus beyond pause and
 * motion, renews each instant; Awtsmoos.com lets Netzach endure without ghosts,
 * one listener through the night, one frame returning to light.
 */
export class NetzachBackgroundEffectSession {
	/**
	 * Creates one explicit background lifecycle owner.
	 * @param {object} [netzachDependencies={}] Browser/test dependencies and renderer override.
	 */
	constructor(netzachDependencies = {}) {
		this.window = netzachDependencies.windowTarget || globalThis.window;
		this.requestFrame = netzachDependencies.requestFrame || globalThis.requestAnimationFrame;
		this.cancelFrame = netzachDependencies.cancelFrame || globalThis.cancelAnimationFrame;
		this.renderer = netzachDependencies.renderer || new MalchusBackgroundMatrixRenderer(netzachDependencies);
		this.frameId = null;
		this.paused = true;
		this.resizeAttached = false;
		this.boundResize = () => {
			this.renderer.resizeCanvas();
		};
	}

	/** Initializes the renderer and stable resize listener, then starts animation. */
	initialize() {
		this.renderer.initializeCanvas();
		this.attachResize();
		this.resume();
	}

	/** Pauses animation while preserving the one resize listener for app lifetime. */
	pause() {
		this.paused = true;
		if (this.frameId !== null) {
			this.cancelFrame(this.frameId);
			this.frameId = null;
		}
	}

	/** Resumes exactly one RAF chain without registering another global listener. */
	resume() {
		this.paused = false;
		if (this.frameId === null) {
			this.paintAndSchedule();
		}
	}

	/** Releases both animation and the global resize listener owned by this session. */
	destroy() {
		this.pause();
		if (this.resizeAttached) {
			this.window.removeEventListener('resize', this.boundResize);
			this.resizeAttached = false;
		}
	}

	/** Attaches the bound resize callback once. */
	attachResize() {
		if (this.resizeAttached) {
			return;
		}
		this.window.addEventListener('resize', this.boundResize);
		this.resizeAttached = true;
	}

	/** Paints one frame and schedules the next frame only while active. */
	paintAndSchedule() {
		if (this.paused) {
			return;
		}
		this.renderer.drawFrame();
		this.frameId = this.requestFrame(() => {
			this.frameId = null;
			this.paintAndSchedule();
		});
	}
}
