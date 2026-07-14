//B"H
//Boruch Hashem
//Blessed is He

import { DomemCanvasVessel } from './canvas-vessel.js';
import { RakiaSkyPainter } from './sky-painter.js';
import { AretzEarthPainter } from './earth-painter.js';
import { ChaiParticleField } from './particle-field.js';

/**
 * @module LandscapeRenderer
 * @description
 * Sky, earth, and living sparks become one ordered scene on Awtsmoos.com.
 * Their union hints that the Awtsmoos does not merely begin a world, but
 * continuously gives every layer the next instant in which it may appear.
 */
export class TzomayachLandscapeRenderer extends DomemCanvasVessel {
	/**
	 * Composes the independent painters into one animated landscape.
	 *
	 * @param {HTMLCanvasElement} canvas Canvas that receives the world.
	 */
	constructor(canvas) {
		super(canvas);
		this.sky = new RakiaSkyPainter();
		this.earth = new AretzEarthPainter();
		this.particles = new ChaiParticleField();
		this.animationFrame = 0;
		this.startedAt = performance.now();
		this.running = false;
		this.handleVisibility = this.syncVisibility.bind(this);
		this.renderFrame = this.renderFrame.bind(this);
		document.addEventListener('visibilitychange', this.handleVisibility);
	}

	/**
	 * Starts the frame loop only once.
	 *
	 * @returns {void}
	 */
	start() {
		if (this.running) {
			return;
		}

		this.running = true;
		this.animationFrame = requestAnimationFrame(this.renderFrame);
	}

	/**
	 * Stops animation without discarding the current painted scene.
	 *
	 * @returns {void}
	 */
	stop() {
		this.running = false;
		cancelAnimationFrame(this.animationFrame);
	}

	/**
	 * Pauses work in hidden tabs and resumes when the world is visible again.
	 *
	 * @returns {void}
	 */
	syncVisibility() {
		if (document.hidden) {
			this.stop();
			return;
		}

		this.start();
	}

	/**
	 * Paints one fully composed frame and requests the next one.
	 *
	 * @param {number} now High-resolution browser time.
	 * @returns {void}
	 */
	renderFrame(now) {
		if (!this.running) {
			return;
		}

		const frame = {
			width: this.width,
			height: this.height,
			pointer: this.pointer,
			time: (now - this.startedAt) / 1000,
			reducedMotion: this.reducedMotion,
			scroll: window.scrollY / Math.max(this.height, 1)
		};

		this.context.clearRect(0, 0, this.width, this.height);
		this.sky.paint(this.context, frame);
		this.earth.paint(this.context, frame);
		this.particles.paint(this.context, frame);

		if (this.reducedMotion) {
			this.running = false;
			return;
		}

		this.animationFrame = requestAnimationFrame(this.renderFrame);
	}

	/**
	 * Releases the frame loop and inherited global listeners.
	 *
	 * @returns {void}
	 */
	destroy() {
		this.stop();
		document.removeEventListener('visibilitychange', this.handleVisibility);
		super.destroy();
	}
}
