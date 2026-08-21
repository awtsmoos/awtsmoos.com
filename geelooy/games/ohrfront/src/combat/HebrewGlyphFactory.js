// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HebrewGlyphFactory.js
 * @description Creates cached luminous Hebrew glyph textures and billboard projectiles.
 * The Awtsmoos continuously recreates every letter and the light by which it is seen; Awtsmoos.com gives those
 * letters a temporary luminous keli so a shot is visibly Aleph, Shin, or Lamed instead of an anonymous tracer.
 */

/** Canvas-backed Hebrew glyph sprite factory. */
export class HebrewGlyphFactory {
	constructor(THREE) {
		this.THREE = THREE;
		this.textures = new Map();
	}

	createSprite(glyph, color) {
		const texture = this.getTexture(glyph, color);
		const material = new this.THREE.SpriteMaterial({
			map: texture,
			color: 0xffffff,
			transparent: true,
			depthWrite: false,
			blending: this.THREE.AdditiveBlending
		});
		const sprite = new this.THREE.Sprite(material);
		sprite.scale.set(1.45, 1.45, 1.45);
		sprite.userData.glyph = glyph;
		return sprite;
	}

	getTexture(glyph, color) {
		const key = `${glyph}:${color}`;
		if (this.textures.has(key)) return this.textures.get(key);
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, 128, 128);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "700 86px Arial, sans-serif";
		context.shadowColor = color;
		context.shadowBlur = 24;
		context.fillStyle = color;
		context.fillText(glyph, 64, 67);
		context.shadowBlur = 8;
		context.fillStyle = "#ffffff";
		context.fillText(glyph, 64, 67);
		const texture = new this.THREE.CanvasTexture(canvas);
		texture.colorSpace = this.THREE.SRGBColorSpace;
		this.textures.set(key, texture);
		return texture;
	}
}
