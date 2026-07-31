// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos reveals a real field of stars and Hebrew letters, animated with restraint and never hidden from the eye.

import { GlyphAtlas } from "./glyphAtlas.js";
import { ParticleField } from "./particleField.js";
import { ParticleRenderer } from "./particleRenderer.js";
import {
	GLYPH_FRAGMENT_SHADER,
	GLYPH_VERTEX_SHADER,
	STAR_FRAGMENT_SHADER,
	STAR_VERTEX_SHADER
} from "./shaderSources.js";

export class ParticleSky {
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
		this.prefersStillness = matchMedia("(prefers-reduced-motion: reduce)").matches;
		this.gl = canvasElement.getContext("webgl", {
			alpha: true,
			antialias: true,
			powerPreference: "low-power"
		});
		this.isRunning = false;
	}

	connect() {
		if (!this.gl) {
			this.setStatus("unavailable");
			return;
		}

		try {
			this.createScene();
			this.resize();
			this.connectEvents();
			this.setStatus(this.prefersStillness ? "static" : "running");
			this.isRunning = !this.prefersStillness;
			this.renderer.draw(0);
			if (this.isRunning) requestAnimationFrame(time => this.render(time));
		} catch (error) {
			console.warn("Awtsmoos particle sky disabled:", error);
			this.setStatus("error");
		}
	}

	createScene() {
		const starField = new ParticleField(this.gl, {
			amount: 110,
			distribution: "sky",
			includesGlyphs: false,
			vertexSource: STAR_VERTEX_SHADER,
			fragmentSource: STAR_FRAGMENT_SHADER
		});
		const glyphField = new ParticleField(this.gl, {
			amount: 22,
			distribution: "galaxy",
			includesGlyphs: true,
			vertexSource: GLYPH_VERTEX_SHADER,
			fragmentSource: GLYPH_FRAGMENT_SHADER
		});
		const atlas = new GlyphAtlas(this.gl).createTexture();
		this.renderer = new ParticleRenderer(this.gl, starField, glyphField, atlas);
	}

	connectEvents() {
		addEventListener("resize", () => {
			this.resize();
			if (this.prefersStillness) this.renderer.draw(0);
		}, { passive: true });
		document.addEventListener("visibilitychange", () => this.handleVisibility());
		this.canvasElement.addEventListener("webglcontextlost", event => {
			event.preventDefault();
			this.isRunning = false;
			this.setStatus("lost");
		});
	}

	handleVisibility() {
		if (this.prefersStillness) return;
		this.isRunning = !document.hidden;
		if (this.isRunning) requestAnimationFrame(time => this.render(time));
	}

	setStatus(status) {
		this.canvasElement.dataset.particleStatus = status;
	}

	resize() {
		const ratio = Math.min(devicePixelRatio, 1.75);
		this.canvasElement.width = Math.round(innerWidth * ratio);
		this.canvasElement.height = Math.round(innerHeight * ratio);
		this.gl.viewport(0, 0, this.canvasElement.width, this.canvasElement.height);
	}

	render(time) {
		if (!this.isRunning) return;
		this.renderer.draw(time);
		requestAnimationFrame(nextTime => this.render(nextTime));
	}
}
