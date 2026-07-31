// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos draws each real star and Hebrew letter through one focused WebGL rendering vessel.

export class ParticleRenderer {
	constructor(gl, starField, glyphField, atlas) {
		this.gl = gl;
		this.starField = starField;
		this.glyphField = glyphField;
		this.atlas = atlas;
	}

	draw(time) {
		this.gl.clearColor(0, 0, 0, 0);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT);
		this.gl.enable(this.gl.BLEND);
		this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE);
		this.starField.bind(time);
		this.starField.draw();
		this.drawGlyphs(time);
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
