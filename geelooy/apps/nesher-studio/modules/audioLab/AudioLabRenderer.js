/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos coordinates sensing, geometry, quality, particles, and readable speech; Awtsmoos.com keeps the hot path free of layout reads and slows only the expensive overlay.
*/
import { AdaptiveParticleBudget } from './AdaptiveParticleBudget.js';
import { AudioCanvasLayout } from './AudioCanvasLayout.js';
import { CanvasHebrewOverlay } from './CanvasHebrewOverlay.js';
import { WebglParticleRiver } from './WebglParticleRiver.js';

export class AudioLabRenderer {
	constructor({ dom, inputBridge, readConfiguration, reportFrame }) {
		this.inputBridge = inputBridge;
		this.readConfiguration = readConfiguration;
		this.reportFrame = reportFrame;
		this.webglRiver = new WebglParticleRiver(dom.audioLabCanvas);
		this.hebrewOverlay = new CanvasHebrewOverlay(dom.audioGlyphCanvas);
		this.budget = new AdaptiveParticleBudget(window);
		const layoutContainer = dom.audioLabCanvas.parentElement || dom.audioLabSection;
		this.layout = new AudioCanvasLayout(layoutContainer, (size) => this.resize(size)).bind();
		this.animationFrame = null;
		this.running = false;
		this.frameCounter = 0;
		this.fps = 0;
		this.lastFpsTime = 0;
		this.lastOverlayTime = 0;
		this.lastHudTime = 0;
	}

	setActive(active) {
		if (active) {
			this.start();
			return;
		}

		this.stop();
	}

	start() {
		if (this.running) return;
		this.running = true;
		this.lastFpsTime = performance.now();
		this.layout.measure();
		this.animationFrame = requestAnimationFrame((time) => this.render(time));
	}

	stop() {
		this.running = false;
		if (this.animationFrame !== null) cancelAnimationFrame(this.animationFrame);
		this.animationFrame = null;
	}

	resize({ width, height, pixelRatio }) {
		this.webglRiver.resize(width, height, pixelRatio);
		this.hebrewOverlay.resize(width, height, pixelRatio);
	}

	render(timeMilliseconds) {
		if (!this.running) return;
		const timeSeconds = timeMilliseconds / 1000;
		const configuration = this.readConfiguration();
		const sampledFrame = this.inputBridge.sample(timeSeconds);
		const frame = this.applySensitivity(sampledFrame, configuration.sensitivity);
		const particleCount = this.budget.particleCount(configuration.density);
		const quality = this.budget.observe(this.fps, timeMilliseconds);
		const hasGpu = this.webglRiver.render(frame, configuration, timeSeconds, particleCount, quality);
		this.renderOverlayIfDue({ frame, configuration, timeSeconds, hasGpu, quality, timeMilliseconds });
		this.updateFps(timeMilliseconds);
		this.reportIfDue({ frame, particleCount, quality, hasGpu, timeMilliseconds });
		this.animationFrame = requestAnimationFrame((time) => this.render(time));
	}

	renderOverlayIfDue({ frame, configuration, timeSeconds, hasGpu, quality, timeMilliseconds }) {
		if (timeMilliseconds - this.lastOverlayTime < 32) return;
		this.hebrewOverlay.render(frame, configuration, timeSeconds, hasGpu, quality);
		this.lastOverlayTime = timeMilliseconds;
	}

	reportIfDue({ frame, particleCount, quality, hasGpu, timeMilliseconds }) {
		if (timeMilliseconds - this.lastHudTime < 90) return;
		this.reportFrame({ frame, particleCount, fps: this.fps, quality, hasGpu, error: this.webglRiver.error });
		this.lastHudTime = timeMilliseconds;
	}

	applySensitivity(frame, sensitivity) {
		const scale = (value) => Math.min(1, value * sensitivity);
		return {
			bass: scale(frame.bass),
			mid: scale(frame.mid),
			treble: scale(frame.treble),
			energy: scale(frame.energy),
			pulse: scale(frame.pulse)
		};
	}

	updateFps(timeMilliseconds) {
		this.frameCounter += 1;
		const elapsed = timeMilliseconds - this.lastFpsTime;
		if (elapsed < 500) return;
		this.fps = Math.round(this.frameCounter * 1000 / elapsed);
		this.frameCounter = 0;
		this.lastFpsTime = timeMilliseconds;
	}
}
