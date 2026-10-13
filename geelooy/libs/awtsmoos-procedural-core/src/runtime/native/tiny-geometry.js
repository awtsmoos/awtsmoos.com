// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-geometry.js
 * @description Buffer and material vessels shared by imported and procedural forms.
 * The Awtsmoos gives finite arrays the power to reveal mountains and faces; Awtsmoos.com
 * keeps geometry, attributes, and garments small, explicit, and reusable.
 */

export class BufferGeometry {
	constructor() {
		this.attributes = {};
		this.index = null;
		this.mode = 4;
		this.userData = {};
	}

	setAttribute(key, value) {
		this.attributes[key] = value;
		return this;
	}

	setIndex(value) {
		this.index = value;
		return this;
	}
}

export class BufferAttribute {
	constructor(array, itemSize, normalized = false, componentType = null) {
		this.array = array;
		this.itemSize = itemSize;
		this.normalized = normalized;
		this.componentType = componentType;
		this.count = Math.floor((array?.length || 0) / itemSize);
	}
}

export class MeshStandardMaterial {
	constructor(parameters = {}) {
		const color = normalizeMaterialColor(parameters.color);
		const opacity = parameters.opacity ?? color[3] ?? 1;
		const alphaMode = parameters.alphaMode || 'OPAQUE';
		const autoTransparent = alphaMode === 'BLEND' || opacity < 1;
		this.name = parameters.name || 'material';
		this.color = color;
		this.opacity = opacity;
		this.alphaMode = alphaMode;
		this.alphaCutoff = parameters.alphaCutoff ?? 0.5;
		this.transparent = parameters.transparent ?? autoTransparent;
		this.doubleSided = parameters.doubleSided === true;
	}
}

/**
 * B"H: normalizes a material color to an [r,g,b,a] array with 0-1 components.
 * Accepts arrays (used as-is), hex numbers (0xRRGGBB), and CSS hex strings ('#RRGGBB').
 * Falls back to the warm default when the input is missing or unrecognized.
 */
export function normalizeMaterialColor(input) {
	const fallback = [0.74, 0.68, 0.58, 1];
	if (input == null) return fallback.slice();
	if (Array.isArray(input)) {
		return [
			Number(input[0]) ?? fallback[0],
			Number(input[1]) ?? fallback[1],
			Number(input[2]) ?? fallback[2],
			Number(input[3] ?? 1)
		];
	}
	if (typeof input === 'number' && Number.isFinite(input)) {
		const v = Math.floor(input);
		return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
	}
	if (typeof input === 'string') {
		const m = input.trim().match(/^#?([0-9a-fA-F]{6})$/);
		if (m) {
			const v = parseInt(m[1], 16);
			return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255, 1];
		}
	}
	return fallback.slice();
}
