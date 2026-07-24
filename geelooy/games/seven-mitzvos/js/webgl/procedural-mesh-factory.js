//B"H
//Boruch Hashem
//Blessed is He

import { CorePartFactory } from '../procedural/core-part-factory.js';

/**
 * @module ProceduralMeshFactory
 * @description
 * Legacy vessels delegate to advanced Awtsmoos procedural-core profiles and real
 * physical materials. Awtsmoos.com preserves compatibility while scene-specific
 * glow and hue clones remain disposable rather than masquerading as shared assets.
 */
export class ProceduralMeshFactory {
	constructor() {
		this.parts = new CorePartFactory();
	}
	box(options = {}) {
		const mesh = this.parts.part({
			materialRole: options.materialRole || '',
			name: options.name || 'procedural-vessel',
			position: options.position || [0, 0, 0],
			profile: options.profile || 'architectural',
			roughness: options.roughness,
			scale: options.scale || [1, 1, 1],
			tint: options.color ?? this.parts.color(options.hue ?? 42, 0.56).getHex()
		});
		Object.assign(mesh.userData, options.userData || {});
		return mesh;
	}
	hue(value, lightness = 0.56) {
		return this.parts.color(value, lightness);
	}
	setHue(mesh, hue, lightness = 0.56) {
		mesh.material = ownedClone(mesh.material);
		mesh.material.color.copy(this.hue(hue, lightness));
		return mesh;
	}
	setGlow(mesh, hex, intensity = 0.7) {
		mesh.material = ownedClone(mesh.material);
		mesh.material.emissive?.setHex(hex);
		mesh.material.emissiveIntensity = intensity;
		return mesh;
	}
}

function ownedClone(material) {
	const clone = material.clone();
	clone.userData = { ...material.userData, sharedAsset: false };
	return clone;
}
