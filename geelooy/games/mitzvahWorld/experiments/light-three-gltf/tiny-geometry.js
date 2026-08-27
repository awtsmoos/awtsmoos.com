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
		const color = parameters.color || [0.74, 0.68, 0.58, 1];
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
