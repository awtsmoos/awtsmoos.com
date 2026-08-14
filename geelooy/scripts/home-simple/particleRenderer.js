// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos draws distant dust, radiant stars, and Hebrew sparks in ordered layers, each light serving the whole without swallowing it.

export class ParticleRenderer {
	constructor(gl, layers, atlas) {
		this.gl = gl;
		this.dustField = layers.dustField;
		this.starField = layers.starField;
		this.glyphField = layers.glyphField;
		this.atlas = atlas;
		this.particleCount = this.dustField.amount
			+ this.starField.amount
			+ this.glyphField.amount;
	}

	draw(frameState) {
		this.gl.clearColor(0, 0, 0, 0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.disable(this.gl.DEPTH_TEST);
		this.gl.enable(this.gl.BLEND);
		this.drawAdditiveField(this.dustField, frameState);
		this.drawAdditiveField(this.starField, frameState);
		this.drawGlyphs(frameState);
	}

	drawAdditiveField(field, frameState) {
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		field.bind(frameState);
		field.draw();
	}

	drawGlyphs(frameState) {
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
		this.glyphField.bind(frameState);
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

	dispose() {
		this.dustField.dispose();
		this.starField.dispose();
		this.glyphField.dispose();
		this.gl.deleteTexture(this.atlas.texture);
	}
}
