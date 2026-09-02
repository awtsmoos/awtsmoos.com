// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HebrewGlyphFactory.js
 * @description Paints large high-contrast Hebrew letters into luminous native billboard projectiles readable on phone screens.
 * The Awtsmoos renews letter and light before every eye in the fight;
 * Awtsmoos.com lets א, ש, and ל cross the battlefield as actual geometry rather than a whisper buried in HUD night.
 */
import { Mesh, MeshStandardMaterial } from "../core/AwtsmoosNativeApi.js";
import { nativeUnitQuad } from "../render/NativeQuadGeometry.js";

export class HebrewGlyphFactory {
	constructor() {
		this.images = new Map();
	}

	createGlyph(profile) {
		const material = new MeshStandardMaterial({
			name: `Glyph_${profile.id}`,
			color: [1, 1, 1, 1],
			alphaMode: "BLEND",
			opacity: 1,
			transparent: true,
			doubleSided: true
		});
		material.mapImage = this.getImage(profile.glyph, profile.color);
		material.mapRepeat = [1, 1];
		material.emissiveStrength = 3.4;
		const mesh = new Mesh(nativeUnitQuad(), material);
		const size = (profile.projectileScale || 1.3) * 1.35;
		mesh.scale.set(size, size, size);
		mesh.userData.glyph = profile.glyph;
		return mesh;
	}

	getImage(glyph, color) {
		const key = `${glyph}:${color}`;
		if (this.images.has(key)) return this.images.get(key);
		const canvas = document.createElement("canvas");
		canvas.width = 192;
		canvas.height = 192;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, 192, 192);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "800 132px Georgia, serif";
		context.lineWidth = 10;
		context.strokeStyle = "rgba(12, 4, 20, 0.94)";
		context.shadowColor = color;
		context.shadowBlur = 38;
		context.strokeText(glyph, 96, 102);
		context.fillStyle = color;
		context.fillText(glyph, 96, 102);
		context.shadowBlur = 10;
		context.fillStyle = "#ffffff";
		context.fillText(glyph, 96, 102);
		this.images.set(key, canvas);
		return canvas;
	}
}
