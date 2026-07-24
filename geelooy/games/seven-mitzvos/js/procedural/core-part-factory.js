//B"H
//Boruch Hashem
//Blessed is He

import * as THREE from '../../../scripts/build/three.module.js';
import { createProceduralThreeMesh } from '../../../../libs/awtsmoos-procedural-core/src/adapters/three/index.js';

/**
 * @module CorePartFactory
 * @description
 * Every visible part begins inside the real Awtsmoos procedural core under
 * geelooy/libs. This Awtsmoos.com vessel shares generated geometry inside one
 * scene, keeping recognizable people and buildings light enough for mobile life.
 */
export class CorePartFactory {
	constructor() {
		this.templates = new Map();
	}

	part(options = {}) {
		const primitive = options.primitive || 'cube';
		const hue = options.hue ?? 42;
		const lightness = options.lightness ?? 0.55;
		const roughness = options.roughness ?? 0.72;
		const metalness = options.metalness ?? 0.05;
		const key = [primitive, hue, lightness, roughness, metalness].join(':');
		if (!this.templates.has(key)) {
			this.templates.set(key, createProceduralThreeMesh(THREE, {
				primitive,
				parameters: primitiveParameters(primitive),
				material: {
					kind: 'standard',
					color: this.color(hue, lightness),
					roughness,
					metalness
				}
			}));
		}
		const mesh = this.templates.get(key).clone();
		mesh.name = options.name || primitive;
		mesh.position.set(...(options.position || [0, 0, 0]));
		mesh.rotation.set(...(options.rotation || [0, 0, 0]));
		mesh.scale.set(...(options.scale || [1, 1, 1]));
		mesh.castShadow = options.castShadow !== false;
		mesh.receiveShadow = options.receiveShadow !== false;
		mesh.userData.awtsmoosCorePart = true;
		return mesh;
	}

	group(name, parts, data = {}) {
		const group = new THREE.Group();
		group.name = name;
		group.add(...parts);
		this.mark(group, data);
		return group;
	}

	mark(root, data = {}) {
		Object.assign(root.userData, data, { semanticRoot: root });
		root.traverse(child => {
			Object.assign(child.userData, data, { semanticRoot: root });
		});
		return root;
	}

	setGlow(root, color, intensity = 0.8) {
		root.traverse(child => {
			if (!child.isMesh) {
				return;
			}
			child.material = child.material.clone();
			child.material.emissive?.setHex(color);
			child.material.emissiveIntensity = intensity;
		});
		return root;
	}

	setHue(root, hue, lightness = 0.55) {
		root.traverse(child => {
			if (!child.isMesh) {
				return;
			}
			child.material = child.material.clone();
			child.material.color.copy(this.color(hue, lightness));
		});
		return root;
	}

	color(hue, lightness = 0.55) {
		const normalizedHue = (((hue % 360) + 360) % 360) / 360;
		return new THREE.Color().setHSL(normalizedHue, 0.7, lightness);
	}
}

function primitiveParameters(primitive) {
	if (primitive === 'sphere' || primitive === 'icosphere') {
		return { radius: 0.5, subdivisions: 1 };
	}
	if (primitive === 'cylinder') {
		return { radius: 0.5, height: 1, radialSegments: 8 };
	}
	if (primitive === 'torus') {
		return { majorRadius: 0.5, minorRadius: 0.16, majorSegments: 12, minorSegments: 6 };
	}
	return { size: 1 };
}