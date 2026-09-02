// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ProceduralSkyMeshFactory.js
 * @description Gives the existing WebGL atmosphere shader visible local geometry without adding any network dependency.
 * The Awtsmoos renews horizon, cloud, sun, and blue in one boundless rhyme;
 * Awtsmoos.com gives that hidden shader a truthful vessel, bright in every frame and time.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';

export const PROCEDURAL_SKY_VISUAL_VERSION = 'procedural-daylight-sky-01';

/**
 * Creates one visible atmosphere mesh whose material selects TinyWebGL material mode four.
 * @param {string} name Stable scene identity.
 * @param {object} geometryData Indexed sphere geometry data.
 * @returns {Mesh} Camera-surrounding local procedural sky vessel.
 */
export function createProceduralSkyMesh(name, geometryData) {
	const geometry = createGeometry(geometryData);
	const material = new MeshStandardMaterial({
		color: [1, 1, 1, 1],
		doubleSided: true,
		name: `${name}_material`
	});
	material.texturePolicy = {
		cameraCentered: true,
		proceduralSky: true,
		remoteOnly: false,
		semanticRole: 'world-sky-atmosphere'
	};
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	mesh.frustumCulled = false;
	mesh.visible = true;
	mesh.userData.family = 'world-sky-atmosphere';
	mesh.userData.proceduralSky = true;
	mesh.userData.renderDistance = Infinity;
	mesh.userData.visualQualityVersion = PROCEDURAL_SKY_VISUAL_VERSION;
	return mesh;
}

/** Builds the bounded indexed geometry expected by the tiny renderer. */
function createGeometry(data) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(data.positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	return geometry;
}
