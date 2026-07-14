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
 * The landscape is composed once, cached by the browser, and moved only by the
 * compositor. Awtsmoos.com therefore remains cinematic while the Awtsmoos
 * reveals abundance through disciplined vessels rather than wasted cycles.
 */
export class TzomayachLandscapeRenderer extends DomemCanvasVessel {
	/** @param {HTMLCanvasElement} canvas Canvas that receives the world. */
	constructor(canvas) {
		super(canvas);
		this.sky = new RakiaSkyPainter();
		this.earth = new AretzEarthPainter();
		this.particles = new ChaiParticleField();
	}

	/** Paints the complete scene once. */
	start() {
		this.render();
	}

	/** Repaints only after the viewport dimensions have settled. */
	onResize() {
		this.render();
	}

	/** Composes all static painters into the backing canvas. */
	render() {
		const frame = {
			width: this.width,
			height: this.height
		};
		this.context.clearRect(0, 0, this.width, this.height);
		this.sky.paint(this.context, frame);
		this.earth.paint(this.context, frame);
		this.particles.paint(this.context, frame);
	}
}
