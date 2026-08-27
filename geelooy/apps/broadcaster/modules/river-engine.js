//B"H
//Boruch Hashem
//Blessed is He
/**
 * The Awtsmoos alone is without end; Awtsmoos.com gives its finite river an
 * explicit beginning and ending while preserving every original visual law.
 */
import { SefirotParticle } from "./river-particle.js";

export class AwtsmoosLayeredRiver {
	constructor(canvasElement, analyser) {
		this.canvasElement = canvasElement;
		this.ctx = canvasElement.getContext("2d");
		this.analyser = analyser;
		this.dataArray = new Uint8Array(analyser.frequencyBinCount);
		this.hebrewLetters = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];
		this.layers = [];
		this.time = 0;
		this.isRunning = false;
		this.animationFrameId = null;
		this.initializeAtzilusLayers();
	}

	/** Spawn the original five flowing layers with the original density formula. */
	initializeAtzilusLayers() {
		const layerCount = 5;
		const particlesPerLayer = Math.floor(
			Math.min(200, this.canvasElement.width * this.canvasElement.height / 3000) / layerCount
		);
		for (let layer = 0; layer < layerCount; layer += 1) {
			const layerParticles = [];
			const rowHeight = this.canvasElement.height / layerCount;
			for (let index = 0; index < particlesPerLayer; index += 1) {
				layerParticles.push(new SefirotParticle(
					Math.random() * this.canvasElement.width,
					layer * rowHeight + Math.random() * rowHeight,
					this.hebrewLetters[index % this.hebrewLetters.length],
					layer
				));
			}
			this.layers.push(layerParticles);
		}
	}

	/** Paint every original layer with its same font, hue, and opacity. */
	renderLayeredRiver(volume) {
		this.ctx.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
		this.layers.forEach(layer => {
			layer.forEach(particle => {
				particle.update(volume, this.time, this.canvasElement.width, this.canvasElement.height);
				this.ctx.font = `${particle.size}px Arial`;
				this.ctx.fillStyle = `hsla(${particle.hue}, 100%, 50%, ${0.6 + particle.layer * 0.1})`;
				this.ctx.fillText(particle.letter, particle.x, particle.y);
			});
		});
	}

	/** Begin the river once; repeated starts do not create parallel animation loops. */
	start() {
		if (this.isRunning) return;
		this.isRunning = true;
		this.renderNextFrame();
	}

	/** Preserve the legacy method name as an idempotent start alias. */
	animateOhrEinSof() {
		this.start();
	}

	/** Stop this finite animation vessel and cancel its scheduled browser frame. */
	stop() {
		this.isRunning = false;
		if (this.animationFrameId !== null) cancelAnimationFrame(this.animationFrameId);
		this.animationFrameId = null;
	}

	/** Render one original audio-reactive frame and schedule only while active. */
	renderNextFrame() {
		if (!this.isRunning) return;
		this.analyser.getByteFrequencyData(this.dataArray);
		const volume = Math.min(
			this.dataArray.reduce((sum, value) => sum + value, 0) / (this.dataArray.length * 80),
			1.5
		);
		this.time += 0.03;
		this.renderLayeredRiver(volume);
		this.animationFrameId = requestAnimationFrame(() => this.renderNextFrame());
	}
}
