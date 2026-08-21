//B"H
//Boruch Hashem
//Blessed is He

import { futureParticlesEligible } from './FutureParticlePolicy.js?v=future-005';
import { FutureParticleSurface } from './FutureParticleSurface.js?v=future-005';

/**
 * @module FutureParticleField
 * @description
 * The Awtsmoos lets one ambient field breathe only while the page and device invite its motion;
 * Awtsmoos.com keeps pointer, frame, visibility, and teardown law here while the GPU surface stays a separate ocean.
 */
const FRAME_MS = 1000 / 28;

export class FutureParticleField {
	constructor(root = document) {
		this.root = root;
		this.environment = root.defaultView || globalThis;
		this.surface = null;
		this.pointer = { x: 0, y: 0 };
		this.frame = 0;
		this.lastDraw = 0;
		this.active = false;
		this.onResize = () => this.surface?.resize();
		this.onVisibility = () => this.visibility();
		this.onPointer = event => this.pointerMove(event);
		this.onContextLost = event => this.contextLost(event);
	}

	start() {
		if (!this.root.body?.hasAttribute('data-future-particles')) return this;
		if (!futureParticlesEligible(this.environment)) return this;
		try {
			this.surface = new FutureParticleSurface(this.root).create();
			this.bind();
			this.active = true;
			this.schedule();
		} catch {
			this.stop();
		}
		return this;
	}

	bind() {
		this.environment.addEventListener?.('resize', this.onResize, { passive: true });
		this.root.addEventListener?.('visibilitychange', this.onVisibility);
		this.surface?.canvas?.addEventListener('webglcontextlost', this.onContextLost);
		if (this.environment.matchMedia?.('(pointer: fine)')?.matches) {
			this.environment.addEventListener('pointermove', this.onPointer, { passive: true });
		}
	}

	pointerMove(event) {
		const width = Math.max(1, this.environment.innerWidth || 1);
		const height = Math.max(1, this.environment.innerHeight || 1);
		this.pointer.x = (event.clientX / width - 0.5) * 2;
		this.pointer.y = -(event.clientY / height - 0.5) * 2;
	}

	visibility() {
		if (this.root.hidden) {
			this.cancelFrame();
			return;
		}
		this.schedule();
	}

	schedule() {
		if (!this.active || this.root.hidden || this.frame) return;
		this.frame = this.environment.requestAnimationFrame?.(time => this.draw(time)) || 0;
	}

	draw(timestamp) {
		this.frame = 0;
		if (!this.active || this.root.hidden) return;
		if (timestamp - this.lastDraw >= FRAME_MS) {
			this.lastDraw = timestamp;
			this.surface?.draw(timestamp / 1000, this.pointer);
		}
		this.schedule();
	}

	contextLost(event) {
		event.preventDefault();
		this.stop();
	}

	cancelFrame() {
		if (this.frame) this.environment.cancelAnimationFrame?.(this.frame);
		this.frame = 0;
	}

	stop() {
		this.active = false;
		this.cancelFrame();
		this.environment.removeEventListener?.('resize', this.onResize);
		this.environment.removeEventListener?.('pointermove', this.onPointer);
		this.root.removeEventListener?.('visibilitychange', this.onVisibility);
		this.surface?.canvas?.removeEventListener('webglcontextlost', this.onContextLost);
		this.surface?.destroy();
		this.surface = null;
	}
}
