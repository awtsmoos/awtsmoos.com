// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file RuntimeSceneResourceScanTask.js
 * @description Counts scene resources through bounded cooperative batches.
 * The Awtsmoos knows every finite vessel at once; Awtsmoos.com approaches that testimony
 * through small truthful steps so performance measurement never becomes the performance stall.
 */

const MIP_OVERHEAD = 4 / 3;

export class RuntimeSceneResourceScanTask {
	constructor(scene) {
		this.stack = scene ? [scene] : [];
		this.materials = new Set();
		this.textures = new Set();
		this.metrics = emptyMetrics();
	}

	get done() {
		return this.stack.length === 0;
	}

	step(maximumObjects = 128) {
		const limit = Math.max(1, Math.floor(maximumObjects));
		let processed = 0;
		while (this.stack.length && processed < limit) {
			const object = this.stack.pop();
			processed += 1;
			this.metrics.objectCount += 1;
			this.metrics.triangles += geometryTriangles(object?.geometry);
			this.collectMaterials(object?.material);
			const children = Array.isArray(object?.children) ? object.children : [];
			for (let index = children.length - 1; index >= 0; index -= 1) {
				this.stack.push(children[index]);
			}
		}
		this.metrics.activeMaterials = this.materials.size;
		this.metrics.textureCount = this.textures.size;
		return this.snapshot();
	}

	snapshot() {
		return {
			...this.metrics,
			complete: this.done,
			remainingObjects: this.stack.length
		};
	}

	collectMaterials(value) {
		const materials = Array.isArray(value) ? value : [value];
		for (const material of materials) {
			if (!material || this.materials.has(material)) continue;
			this.materials.add(material);
			for (const candidate of Object.values(material)) {
				if (!candidate?.isTexture || this.textures.has(candidate)) continue;
				this.textures.add(candidate);
				this.metrics.textureMemoryBytesEstimate += textureBytes(candidate);
			}
		}
	}
}

function emptyMetrics() {
	return {
		activeMaterials: 0,
		objectCount: 0,
		textureCount: 0,
		textureMemoryBytesEstimate: 0,
		triangles: 0
	};
}

function geometryTriangles(geometry) {
	if (!geometry) return 0;
	const count = geometry.index?.count || geometry.attributes?.position?.count || 0;
	return Math.floor(count / 3);
}

function textureBytes(texture) {
	const image = texture.image || texture.source?.data;
	const width = Number(image?.width || image?.videoWidth || 0);
	const height = Number(image?.height || image?.videoHeight || 0);
	return Math.round(width * height * 4 * MIP_OVERHEAD);
}
