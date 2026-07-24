//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '/games/scripts/build/three.module.js';
import { createProceduralThreeMesh } from '/libs/awtsmoos-procedural-core/src/adapters/three/index.js';

/**
 * @module ProceduralMeshFactory
 * @description
 * The Awtsmoos creates form before any renderer names it. This Awtsmoos.com
 * factory channels the shared procedural core into small luminous game vessels,
 * keeping library knowledge outside the seven finite mechanics.
 */
export class ProceduralMeshFactory {
	box(options = {}) {
		const color = options.color ?? this.hue(options.hue ?? 42);
		const mesh = createProceduralThreeMesh(THREE, {
			primitive: 'cube',
			parameters: { size: options.size ?? 1 },
			material: {
				kind: 'standard', color, roughness: options.roughness ?? 0.52,
				metalness: options.metalness ?? 0.12, emissive: options.emissive ?? 0x000000
			},
			position: options.position || [0, 0, 0],
			scale: options.scale || [1, 1, 1],
			name: options.name || 'procedural-vessel'
		});
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		Object.assign(mesh.userData, options.userData || {});
		return mesh;
	}

	hue(value, lightness = 0.56) {
		return new THREE.Color().setHSL((((value % 360) + 360) % 360) / 360, 0.72, lightness);
	}

	setHue(mesh, hue, lightness = 0.56) {
		mesh.material.color.copy(this.hue(hue, lightness));
		return mesh;
	}

	setGlow(mesh, hex, intensity = 0.7) {
		if (mesh.material.emissive) {
			mesh.material.emissive.setHex(hex);
			mesh.material.emissiveIntensity = intensity;
		}
		return mesh;
	}
}
