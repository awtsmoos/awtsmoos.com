// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos conducts the GPU sky through birth, stillness, loss, and restoration, while focused vessels own runtime and time.

import { ParticleAnimator } from "./particle-animator.js";
import { ParticlePointer } from "./particle-pointer.js";
import { ParticleQualityPolicy } from "./particle-quality.js";
import { ParticleRuntime } from "./particle-runtime.js";

export class ParticleSky {
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
		this.qualityPolicy = new ParticleQualityPolicy();
		this.profile = this.qualityPolicy.createProfile();
		this.pointer = new ParticlePointer({ isInteractive: !this.profile.isStatic });
		this.animator = new ParticleAnimator({
			canvasElement,
			pointer: this.pointer,
			profile: this.profile,
			drawHandler: frameState => this.runtime?.draw(frameState),
			degradeHandler: timestamp => this.degrade(timestamp)
		});
		this.runtime = new ParticleRuntime(canvasElement, this.profile, this.animator);
		this.resizeFrame = 0;
	}

	connect() {
		try {
			if (!this.runtime.createContext()) {
				this.setStatus("unavailable");
				return this;
			}

			this.pointer.connect();
			this.connectEvents();
			this.runtime.rebuildScene("building");
			this.runtime.resize();
			this.animator.drawStatic();
			this.profile.isStatic ? this.setStatus("static") : this.start();
		} catch (error) {
			console.warn("Awtsmoos WebGL sky disabled:", error);
			this.setStatus("error");
		}

		return this;
	}

	connectEvents() {
		addEventListener("resize", () => this.scheduleResize(), { passive: true });
		document.addEventListener("visibilitychange", () => this.handleVisibility());
		this.canvasElement.addEventListener("webglcontextlost", event => this.handleContextLost(event));
		this.canvasElement.addEventListener("webglcontextrestored", () => this.handleContextRestored());
	}

	scheduleResize() {
		if (this.resizeFrame) {
			return;
		}

		this.resizeFrame = requestAnimationFrame(() => {
			this.resizeFrame = 0;
			this.runtime.resize();
		});
	}

	handleVisibility() {
		if (document.hidden) {
			this.animator.stop();
			this.setStatus("paused");
			return;
		}

		if (!this.profile.isStatic) {
			this.start();
		}
	}

	handleContextLost(event) {
		event.preventDefault();
		this.animator.stop();
		this.runtime.releaseLostScene();
		this.setStatus("lost");
	}

	handleContextRestored() {
		try {
			this.runtime.createContext();
			this.runtime.rebuildScene("restoring");
			this.runtime.resize();
			this.animator.drawStatic();
			this.profile.isStatic ? this.setStatus("static") : this.start();
		} catch (error) {
			console.warn("Awtsmoos WebGL restoration failed:", error);
			this.setStatus("error");
		}
	}

	start() {
		this.setStatus(this.profile.tier === "low" ? "degraded" : "running");
		this.animator.start();
	}

	degrade(timestamp) {
		this.profile = this.qualityPolicy.downgrade(this.profile);
		this.runtime.updateProfile(this.profile);
		this.runtime.rebuildScene("degraded");
		this.runtime.resize();
		this.animator.drawStatic(timestamp);
	}

	setStatus(status) {
		this.canvasElement.dataset.particleStatus = status;
	}
}
