// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos turns letters into galaxies without noise or show, a hidden alef drifting where quiet currents flow.

import { GlyphAtlas } from "./glyphAtlas.js";
import { ParticleField } from "./particleField.js";
import {
	GLYPH_FRAGMENT_SHADER,
	GLYPH_VERTEX_SHADER,
	STAR_FRAGMENT_SHADER,
	STAR_VERTEX_SHADER
} from "./shaderSources.js";

export class ParticleSky {
	constructor(canvasElement) {
		this.canvasElement = canvasElement;
		this.gl = canvasElement.getContext("webgl", {
			alpha: true,
			antialias: true,
			powerPreference: "low-power"
		});
		this.isRunning = false;
	}

	connect() {
		if (!this.gl || matchMedia("(prefers-reduced-motion: reduce)").matches) {
			this.canvasElement.hidden = true;
			return;
		}

		try {
			this.createScene();
			this.resize();
			this.connectEvents();
			this.isRunning = true;
			requestAnimationFrame(time => this.render(time));
		} catch (error) {
			console.warn("Awtsmoos particle sky disabled:", error);
			this.canvasElement.hidden = true;
		}
	}

	createScene() {
		this.starField = new ParticleField(this.gl, {
			amount: 72,
			distribution: "sky",
			includesGlyphs: false,
			vertexSource: STAR_VERTEX_SHADER,
			fragmentSource: STAR_FRAGMENT_SHADER
		});

		this.glyphField = new ParticleField(this.gl, {
			amount: 18,
			distribution: "galaxy",
			includesGlyphs: true,
			vertexSource: GLYPH_VERTEX_SHADER,
			fragmentSource: GLYPH_FRAGMENT_SHADER
		});

		this.atlas = new GlyphAtlas(this.gl).createTexture();
	}

	connectEvents() {
		addEventListener("resize", () => this.resize(), { passive: true });
		document.addEventListener("visibilitychange", () => {
			this.isRunning = !document.hidden;
			if (this.isRunning) {
				requestAnimationFrame(time => this.render(time));
			}
		});
		this.canvasElement.addEventListener("webglcontextlost", event => {
			event.preventDefault();
			this.isRunning = false;
		});
	}

	resize() {
		const ratio = Math.min(devicePixelRatio, 1.5);
		this.canvasElement.width = Math.round(innerWidth * ratio);
		this.canvasElement.height = Math.round(innerHeight * ratio);
		this.gl.viewport(0, 0, this.canvasElement.width, this.canvasElement.height);
	}

	render(time) {
		if (!this.isRunning) {
			return;
		}

		this.gl.clearColor(0, 0, 0, 0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		this.starField.bind(time);
		this.starField.draw();
		this.drawGlyphs(time);
		requestAnimationFrame(nextTime => this.render(nextTime));
	}

	drawGlyphs(time) {
		this.glyphField.bind(time);
		this.gl.activeTexture(this.gl.TEXTURE0);
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.atlas.texture);
		this.gl.uniform1i(this.glyphField.program.uniform("u_atlas"), 0);
		this.gl.uniform2f(
			this.glyphField.program.uniform("u_grid"),
			this.atlas.columns,
			this.atlas.rows
		);
		this.glyphField.draw();
	}
}
