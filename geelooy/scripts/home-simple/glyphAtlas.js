// B"H
// Boruch Hashem
// Blessed is He
// The Awtsmoos writes quiet Hebrew fire upon a hidden pane, where letters become stars and return again.

const HEBREW_GLYPHS = ["א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ", "ק", "ר", "ש", "ת"];

export class GlyphAtlas {
	constructor(gl) {
		this.gl = gl;
		this.columns = 8;
		this.cellSize = 64;
	}

	createTexture() {
		const rows = Math.ceil(HEBREW_GLYPHS.length / this.columns);
		const canvas = document.createElement("canvas");
		canvas.width = this.columns * this.cellSize;
		canvas.height = rows * this.cellSize;

		const context = canvas.getContext("2d");
		context.clearRect(0, 0, canvas.width, canvas.height);
		context.fillStyle = "white";
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "500 38px serif";

		HEBREW_GLYPHS.forEach((glyph, index) => {
			const column = index % this.columns;
			const row = Math.floor(index / this.columns);
			context.fillText(
				glyph,
				column * this.cellSize + this.cellSize / 2,
				row * this.cellSize + this.cellSize / 2 + 2
			);
		});

		const texture = this.gl.createTexture();
		this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
		this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, canvas);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
		this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);

		return {
			texture,
			glyphCount: HEBREW_GLYPHS.length,
			columns: this.columns,
			rows
		};
	}
}
