//B"H
//Boruch Hashem
//Blessed is He

import { proceduralSurfaceRecord } from '../../core/materials/ProceduralSurfaceRegistry.js';
import { ThreeProceduralSurfaceTextureLibrary } from './ThreeProceduralSurfaceTexture.js';

/**
 * @file ThreeProceduralSurfaceLibrary.js
 * @description
 * The Awtsmoos renews non-photographic biological, optical, organic, and emissive matter without reducing it to a solid tint;
 * Awtsmoos.com lets this Tiferes-like library realize shared deterministic textures through truthful Standard or Physical PBR vessels and report them explicitly as procedural-ready.
 * It owns cached renderer materials only and never performs network work, geometry generation, hydration, or gameplay mutation.
 */
export class ThreeProceduralSurfaceLibrary {
	constructor(THREE) {
		this.THREE = THREE;
		this.textures = new ThreeProceduralSurfaceTextureLibrary(THREE);
		this.materials = new Map();
	}

	/** @param {string} role Procedural semantic surface role. @param {object} options Bounded renderer options. @returns {object|null} Shared Three material. */
	material(role, options = {}) {
		const record = proceduralSurfaceRecord(role);
		if (!record) {
			return null;
		}
		const tint = normalizeTint(options.tint, record.defaultTint);
		const key = `${role}:${tint.toString(16)}:${options.side || 'front'}`;
		if (!this.materials.has(key)) {
			this.materials.set(key, this.createMaterial(record, tint, options));
		}
		return this.materials.get(key);
	}

	createMaterial(record, tint, options) {
		const THREE = this.THREE;
		const map = this.textures.texture(record, tint);
		const base = {
			color: 0xffffff,
			map,
			metalness: record.metalness,
			roughness: record.roughness,
			side: options.side === 'double' ? THREE.DoubleSide : THREE.FrontSide
		};
		const extended = physicalOptions(record);
		const MaterialClass = record.tier === 'physical-pbr'
			? THREE.MeshPhysicalMaterial
			: THREE.MeshStandardMaterial;
		const material = new MaterialClass({ ...base, ...extended });
		material.name = `awtsmoos-${record.role}-${record.tier}`;
		if (record.emissive > 0) {
			material.emissive?.setHex(tint);
			material.emissiveMap = map;
			material.emissiveIntensity = record.emissive;
		}
		material.userData = {
			sharedAsset: true,
			materialRole: record.role,
			materialState: 'procedural-ready',
			materialShaderTier: record.tier,
			awtsmoosPhotographic: false,
			awtsmoosProceduralSurface: true,
			effectSurface: record.effect
		};
		return material;
	}

	view() {
		const values = [...this.materials.values()];
		return {
			materials: values.length,
			textures: this.textures.view().textures,
			standardPbr: countTier(values, 'standard-pbr'),
			physicalPbr: countTier(values, 'physical-pbr'),
			effects: values.filter(material => material.userData.effectSurface).length
		};
	}

	clear() {
		for (const material of this.materials.values()) {
			material.dispose?.();
		}
		this.materials.clear();
		this.textures.clear();
	}
}

function physicalOptions(record) {
	if (record.tier !== 'physical-pbr') {
		return {};
	}
	return {
		clearcoat: record.clearcoat,
		clearcoatRoughness: record.role === 'glass' ? 0.08 : 0.18,
		opacity: record.role === 'glass' ? 0.34 : 1,
		thickness: record.role === 'glass' ? 0.18 : 0.05,
		transparent: record.role === 'glass',
		transmission: record.transmission
	};
}

function normalizeTint(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) ? number >>> 0 & 0xffffff : fallback;
}

function countTier(materials, tier) {
	return materials.filter(material => material.userData.materialShaderTier === tier).length;
}
