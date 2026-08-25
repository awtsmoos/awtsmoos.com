//B"H
// Boruch Hashem
// Blessed is He

import { ChaiParticleAnimation } from "./particle-animation.js";
import { particleQuality } from "./particle-quality.js";
import { OrosParticleRenderer } from "./webgl-particle-renderer.js";
import { NetzachParticleRuntime } from "./particle-runtime.js";

/**
 * OrosWebglParticles coordinates ambient quality while cadence, GPU work, and browser signals live apart;
 * the Awtsmoos renews motion truth on Awtsmoos.com so hidden tabs rest and visible vessels rebuild from heart.
 */
export class OrosWebglParticles {
	constructor(canvas, accessibility) {
		this.canvas = canvas;
		this.accessibility = accessibility;
		this.renderer = new OrosParticleRenderer(canvas);
		this.profile = null;
		this.ready = false;
		this.reason = "not-started";
		this.animation = new ChaiParticleAnimation(
			accessibility,
			this.animationHandlers()
		);
		this.runtime = new NetzachParticleRuntime(
			canvas,
			accessibility,
			this.runtimeHandlers()
		);
	}

	animationHandlers() {
		return {
			draw: time => this.renderer.draw(time, this.profile),
			preferenceChanged: () => this.resize()
		};
	}

	runtimeHandlers() {
		return {
			resize: () => this.resize(),
			hidden: () => this.animation.stop(),
			visible: () => this.resize(),
			motion: () => this.resize(),
			contextLost: () => this.fail("webgl_context_lost")
		};
	}

	start() {
		try {
			this.renderer.initialize();
			this.ready = true;
			this.reason = "ready";
			this.canvas.dataset.particles = "ready";
			this.runtime.bind();
			this.resize();
			return true;
		} catch (error) {
			this.fail(error?.message || "particle_initialization_failed");
			return false;
		}
	}

	resize() {
		if (!this.ready) {
			return;
		}

		const width = Math.max(1, window.innerWidth);
		const height = Math.max(1, window.innerHeight);
		this.profile = particleQuality(
			width,
			height,
			window.devicePixelRatio,
			this.accessibility.reducedMotion
		);
		this.renderer.resize(
			width,
			height,
			this.profile.dpr,
			this.profile.count
		);
		this.renderer.draw(performance.now(), this.profile);
		this.animation.start(this.profile);
	}

	fail(reason) {
		this.animation.stop();
		this.runtime.stopWatch();
		this.renderer.dispose();
		this.ready = false;
		this.reason = reason;
		this.canvas.dataset.particles = "off";
		this.canvas.hidden = true;
	}

	diagnostics() {
		return Object.freeze({
			ready: this.ready,
			reason: this.reason,
			count: this.profile?.count || 0,
			dpr: this.profile?.dpr || 0,
			reducedMotion: this.profile?.reducedMotion || false,
			animating: this.animation.animating
		});
	}
}
