// B"H
// Boruch Hashem
// Blessed is He

/**
 * @class NleWebGlWorldRenderer
 * @description
 * An offscreen WebGL frame reveals the editable village and GPU particles before
 * the same pixels enter preview, playback, recording, and social attachment.
 */

import { drawCinematicFallback } from './NleCinematicFallbackRenderer.js';
import { createCinematicSceneFrame } from './NleCinematicSceneData.js';
import { createCinematicParticleFrame } from './NleWebGlParticles.js';
import {
	createCinematicPrograms,
	drawCinematicPoints,
	drawCinematicTriangles
} from './NleWebGlProgram.js';

export class NleWebGlWorldRenderer {
	constructor() {
		this.canvas = document.createElement('canvas');
		this.mode = 'uninitialized';
		this.contextLost = false;
		this.bindContextEvents();
	}

	draw(target, project, asset, time, duration) {
		const width = target.canvas.width;
		const height = target.canvas.height;
		const frame = createCinematicSceneFrame(project, asset, time, duration, width, height);
		const points = createCinematicParticleFrame(project, asset, frame, time);
		try {
			this.ensure(width, height);
			if (!this.gl || this.contextLost) throw new Error('WebGL unavailable.');
			this.renderWebGl(frame, points, width, height);
			target.drawImage(this.canvas, 0, 0, width, height);
			this.mode = 'webgl';
		} catch {
			drawCinematicFallback(target, frame, points);
			this.mode = 'fallback-2d';
		}
		return this.mode;
	}

	ensure(width, height) {
		if (this.canvas.width !== width) this.canvas.width = width;
		if (this.canvas.height !== height) this.canvas.height = height;
		if (this.gl) return;
		this.gl = this.canvas.getContext('webgl', { alpha: false, antialias: true, preserveDrawingBuffer: true });
		if (!this.gl) return;
		this.programs = createCinematicPrograms(this.gl);
	}

	renderWebGl(frame, points, width, height) {
		const gl = this.gl;
		gl.viewport(0, 0, width, height);
		gl.clearColor(0.03, 0.05, 0.08, 1);
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.disable(gl.DEPTH_TEST);
		drawCinematicTriangles(gl, this.programs.scene, frame.triangles, width, height);
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		drawCinematicPoints(gl, this.programs.points, points, width, height);
		gl.disable(gl.BLEND);
	}

	bindContextEvents() {
		this.canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); this.contextLost = true; this.mode = 'fallback-2d'; });
		this.canvas.addEventListener('webglcontextrestored', () => { this.gl = null; this.programs = null; this.contextLost = false; this.mode = 'restoring'; });
	}
}
