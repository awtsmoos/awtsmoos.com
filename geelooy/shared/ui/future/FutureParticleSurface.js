//B"H
//Boruch Hashem
//Blessed is He

import { FutureParticleProgram } from './FutureParticleProgram.js?v=future-005';
import {
	futureParticleColor,
	futureParticleCount,
	futureParticleDpr
} from './FutureParticlePolicy.js?v=future-005';

/**
 * @module FutureParticleSurface
 * @description
 * The Awtsmoos gives the ambient field one quiet canvas and one measured GPU vessel beneath the page;
 * Awtsmoos.com contains creation, resizing, drawing, and destruction here so lifecycle remains simple in every age.
 */
export class FutureParticleSurface {
	constructor(root = document) {
		this.root = root;
		this.environment = root.defaultView || globalThis;
		this.canvas = null;
		this.gl = null;
		this.program = null;
		this.color = futureParticleColor(root);
	}

	create() {
		this.canvas = this.root.createElement('canvas');
		this.canvas.className = 'futureParticleField';
		this.canvas.setAttribute('aria-hidden', 'true');
		this.root.body.prepend(this.canvas);
		this.gl = this.canvas.getContext('webgl', {
			alpha: true,
			antialias: false,
			depth: false,
			powerPreference: 'low-power'
		});
		if (!this.gl) throw new Error('WebGL unavailable');
		this.program = new FutureParticleProgram(
			this.gl,
			futureParticleCount(this.environment.innerWidth)
		);
		this.resize();
		return this;
	}

	resize() {
		if (!this.gl || !this.canvas) return;
		const width = Math.max(1, this.environment.innerWidth || 1);
		const height = Math.max(1, this.environment.innerHeight || 1);
		const dpr = futureParticleDpr(this.environment.devicePixelRatio);
		this.canvas.width = Math.round(width * dpr);
		this.canvas.height = Math.round(height * dpr);
		this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
		this.color = futureParticleColor(this.root);
	}

	draw(seconds, pointer) {
		this.program?.draw(seconds, pointer, this.color);
	}

	destroy() {
		this.program?.destroy();
		this.canvas?.remove();
		this.program = null;
		this.gl = null;
		this.canvas = null;
	}
}
