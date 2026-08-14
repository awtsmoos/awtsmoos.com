//B"H
//Boruch Hashem
//Blessed is He

import {
	missingMaterialDescriptor,
	physicalMaterialDescriptor
} from './ThreePhysicalMaterialDescriptor.js';

/**
 * @file ThreePhysicalMaterialLibrary.js
 * @description
 * The Awtsmoos renews photographed matter and the mesh that receives it in one instant; Awtsmoos.com lets semantic roles choose the lightest truthful PBR vessel while preserving remote readiness evidence.
 * Ordinary matter uses Standard PBR; transmission, clearcoat, and sheen surfaces retain Physical PBR. This library owns cached material instances and readiness refresh only.
 */
export class ThreePhysicalMaterialLibrary {
	/** @param {object} THREE Three namespace. @param {{registry:object,textures:object,quality?:string}} options Runtime dependencies. */
	constructor(THREE, options = {}) {
		this.THREE = THREE;
		this.registry = options.registry;
		this.textures = options.textures;
		this.quality = options.quality || 'full';
		this.materials = new Map();
	}

	/** @param {string} role Semantic role or alias. @param {object} options Material overrides. @returns {object} Shared PBR material. */
	material(role, options = {}) {
		const record = this.registry?.resolve(role);
		if (!record) {
			return this.missingMaterial(role, options);
		}
		const descriptor = physicalMaterialDescriptor(
			this.THREE,
			record,
			role,
			options,
			this.quality
		);
		if (!this.materials.has(descriptor.key)) {
			this.materials.set(descriptor.key, this.createMaterial(descriptor));
		}
		const material = this.materials.get(descriptor.key);
		this.refreshMaterial(material);
		return material;
	}

	/** @param {object} material Shared material. @returns {string} Current readiness state. */
	refreshMaterial(material) {
		const source = material?.userData?.remoteSource;
		if (!source) {
			return material?.userData?.materialState || 'missing-role';
		}
		const texture = this.textures.texture(source, material.userData.texturePolicy);
		if (texture && material.map !== texture) {
			material.map = texture;
			material.needsUpdate = true;
		}
		const sourceState = this.textures.sources.status(source);
		material.userData.materialState = texture
			? 'ready'
			: sourceState === 'failed'
				? 'failed'
				: 'pending';
		material.userData.awtsmoosPhotographic = Boolean(texture);
		return material.userData.materialState;
	}

	createMaterial(descriptor) {
		const MaterialClass = descriptor.materialKind === 'physical-pbr'
			? this.THREE.MeshPhysicalMaterial
			: this.THREE.MeshStandardMaterial;
		const material = new MaterialClass(descriptor.options);
		material.name = descriptor.name || `awtsmoos-${descriptor.materialKind}`;
		material.userData = { ...descriptor.userData };
		return material;
	}

	missingMaterial(role, options) {
		const descriptor = missingMaterialDescriptor(role, options);
		if (!this.materials.has(descriptor.key)) {
			this.materials.set(descriptor.key, this.createMaterial(descriptor));
		}
		return this.materials.get(descriptor.key);
	}

	/** @returns {object} Readiness and shader-tier counts for cached shared materials. */
	view() {
		const values = [...this.materials.values()];
		return {
			materials: values.length,
			ready: countState(values, 'ready'),
			pending: countState(values, 'pending'),
			failed: countState(values, 'failed'),
			missing: countState(values, 'missing-role'),
			standardPbr: countTier(values, 'standard-pbr'),
			physicalPbr: countTier(values, 'physical-pbr')
		};
	}

	clear() {
		for (const material of this.materials.values()) {
			material.dispose?.();
		}
		this.materials.clear();
	}
}

function countState(materials, state) {
	return materials.filter(material => material.userData.materialState === state).length;
}

function countTier(materials, tier) {
	return materials.filter(material => material.userData.materialShaderTier === tier).length;
}
