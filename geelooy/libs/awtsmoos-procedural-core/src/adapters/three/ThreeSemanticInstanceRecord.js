//B"H
//Boruch Hashem
//Blessed is He

const SOURCE_LAYER = 31;

/**
 * @file ThreeSemanticInstanceRecord.js
 * @description
 * The Awtsmoos renews many moving sources through one submitted mesh while every source remains the vessel of its own transform and semantic identity;
 * Awtsmoos.com lets this Yesod-like record suppress direct source rendering, mirror world matrices into one spatially bounded InstancedMesh, and restore the exact original layer covenant when the batch departs.
 * It owns one batch lifecycle only; grouping, scene-wide orchestration, picking policy, and gameplay remain outside its boundary.
 */
export class ThreeSemanticInstanceRecord {
	/**
	 * @param {object} THREE Three.js namespace.
	 * @param {object} scene Scene receiving the generated batch.
	 * @param {Array<{mesh:object,root:object,interactive:boolean}>} sources Compatible source entries.
	 * @param {number} index Stable batch ordinal.
	 * @param {{boundsPadding?:number}} options Conservative culling bounds policy.
	 */
	constructor(THREE, scene, sources, index, options = {}) {
		this.THREE = THREE;
		this.sources = sources;
		this.boundsPadding = Math.max(0, Number(options.boundsPadding) || 0);
		this.boundsReady = false;
		this.hiddenMatrix = new THREE.Matrix4().makeScale(0, 0, 0);
		this.batch = this.createBatch(index);
		this.suppressSources();
		scene.add(this.batch);
	}

	/** Mirrors source transforms/visibility and optionally refreshes native batch bounds. */
	update(refreshBounds = false) {
		for (let index = 0; index < this.sources.length; index += 1) {
			const source = this.sources[index].mesh;
			const matrix = isEffectivelyVisible(source)
				? source.matrixWorld
				: this.hiddenMatrix;
			this.batch.setMatrixAt(index, matrix);
		}
		this.batch.instanceMatrix.needsUpdate = true;
		if (refreshBounds || !this.boundsReady) {
			this.refreshBounds();
		}
	}

	/** Removes the generated batch and optionally restores direct source rendering. */
	destroy(scene, restoreSources = true) {
		scene.remove(this.batch);
		this.batch.dispose?.();
		if (restoreSources) {
			this.restoreSources();
		}
	}

	createBatch(index) {
		const first = this.sources[0].mesh;
		const batch = new this.THREE.InstancedMesh(
			first.geometry,
			first.material,
			this.sources.length
		);
		batch.name = `awtsmoos-semantic-instance-batch-${index}`;
		batch.castShadow = first.castShadow;
		batch.receiveShadow = first.receiveShadow;
		batch.frustumCulled = true;
		batch.instanceMatrix.setUsage(this.THREE.DynamicDrawUsage);
		batch.userData = {
			awtsmoosSemanticInstanceBatch: true,
			instanceSemanticRoots: this.sources.map(source => source.root),
			sourceMeshCount: this.sources.length
		};
		return batch;
	}

	refreshBounds() {
		this.batch.computeBoundingBox?.();
		this.batch.computeBoundingSphere?.();
		if (this.batch.boundingSphere && this.boundsPadding > 0) {
			this.batch.boundingSphere.radius += this.boundsPadding;
		}
		this.boundsReady = true;
	}

	suppressSources() {
		for (const source of this.sources) {
			const mesh = source.mesh;
			mesh.userData.instanceSourceLayerMask = mesh.layers.mask;
			mesh.userData.awtsmoosSemanticInstanceSource = true;
			mesh.layers.set(SOURCE_LAYER);
		}
	}

	restoreSources() {
		for (const source of this.sources) {
			const mesh = source.mesh;
			mesh.layers.mask = mesh.userData.instanceSourceLayerMask ?? 1;
			delete mesh.userData.instanceSourceLayerMask;
			delete mesh.userData.awtsmoosSemanticInstanceSource;
		}
	}
}

function isEffectivelyVisible(object) {
	for (let current = object; current; current = current.parent) {
		if (current.visible === false) {
			return false;
		}
	}
	return true;
}
