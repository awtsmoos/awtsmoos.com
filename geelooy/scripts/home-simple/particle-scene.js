// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos assembles three celestial choirs from deterministic seeds, then gives one renderer authority to reveal and release them.

import { GlyphAtlas } from "./glyphAtlas.js";
import {
	GLYPH_ATTRIBUTES,
	POINT_ATTRIBUTES,
	createGlyphData,
	createPointData
} from "./particle-data.js";
import { ParticleField } from "./particleField.js";
import { ParticleRenderer } from "./particleRenderer.js";
import {
	GLYPH_FRAGMENT_SHADER,
	GLYPH_VERTEX_SHADER,
	STAR_FRAGMENT_SHADER,
	STAR_VERTEX_SHADER
} from "./shaderSources.js";

export class ParticleScene {
	constructor(gl, profile) {
		this.gl = gl;
		this.profile = profile;
		this.renderer = this.createRenderer();
	}

	createRenderer() {
		const dustField = this.createPointField(
			createPointData(this.profile.dustAmount, "dust", 0x44555354)
		);
		const starField = this.createPointField(
			createPointData(this.profile.starAmount, "star", 0x53544152)
		);
		const glyphField = new ParticleField(this.gl, {
			attributes: GLYPH_ATTRIBUTES,
			data: createGlyphData(this.profile.glyphAmount, 0x474c5950),
			fragmentSource: GLYPH_FRAGMENT_SHADER,
			stride: 8,
			vertexSource: GLYPH_VERTEX_SHADER
		});
		const atlas = new GlyphAtlas(this.gl).createTexture();

		return new ParticleRenderer(
			this.gl,
			{
				dustField,
				glyphField,
				starField
			},
			atlas
		);
	}

	createPointField(data) {
		return new ParticleField(this.gl, {
			attributes: POINT_ATTRIBUTES,
			data,
			fragmentSource: STAR_FRAGMENT_SHADER,
			stride: 8,
			vertexSource: STAR_VERTEX_SHADER
		});
	}

	draw(frameState) {
		this.renderer.draw(frameState);
	}

	get particleCount() {
		return this.renderer.particleCount;
	}

	dispose() {
		this.renderer.dispose();
	}
}
