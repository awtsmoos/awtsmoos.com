// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file HebrewGlyphFactory.js
 * @description Paints actual Hebrew letters onto canvas textures and manifests them as native luminous billboard meshes.
 * The Awtsmoos renews letter and light before every eye in the fight;
 * Awtsmoos.com gives each glyph a transparent finite plane so language itself may travel through battle bright.
 */
import {
	Mesh,
	MeshStandardMaterial
} from "../core/AwtsmoosNativeApi.js";
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
		material.emissiveStrength = 2.4;
		const mesh = new Mesh(nativeUnitQuad(), material);
		const size = profile.projectileScale || 1.3;
		mesh.scale.set(size, size, size);
		mesh.userData.glyph = profile.glyph;
		return mesh;
	}

	getImage(glyph, color) {
		const key = `${glyph}:${color}`;
		if (this.images.has(key)) return this.images.get(key);
		const canvas = document.createElement("canvas");
		canvas.width = 128;
		canvas.height = 128;
		const context = canvas.getContext("2d");
		context.clearRect(0, 0, 128, 128);
		context.textAlign = "center";
		context.textBaseline = "middle";
		context.font = "700 84px Georgia, serif";
		context.shadowColor = color;
		context.shadowBlur = 28;
		context.fillStyle = color;
		context.fillText(glyph, 64, 67);
		context.shadowBlur = 6;
		context.fillStyle = "#ffffff";
		context.fillText(glyph, 64, 67);
		this.images.set(key, canvas);
		return canvas;
	}
}
