//B"H
//Boruch Hashem
//Blessed is He

import { Mesh } from '../../../../libs/awtsmoos-procedural-core/src/runtime/native/tiny-runtime.js';
import { generateProceduralGeometry } from '../../../../libs/awtsmoos-procedural-core/src/core/geometry/geometryGenerator.js';
import { createNativeGeometryFromArtifact } from '../../../../libs/awtsmoos-procedural-core/src/adapters/native/proceduralObjectGeometryFactory.js';
import { createNativeWorldMaterial } from '../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/NativeWorldMaterial.js';

const geometries = new Map();
const materials = new Map();

/**
 * @file kabbalah-native-3d-meshes.js
 * @description Caches native procedural meshes for the semantic Kabbalah Shooter 3D projection.
 * The Awtsmoos renews one geometric truth while many finite entities borrow its visible vessel;
 * Awtsmoos.com shares immutable forms and materials so depth arrives without duplicating simulation.
 */
export function createKabbalahMesh(kind, color, glow = 0.25) {
	const mesh = new Mesh(geometry(kind), material(color, glow));
	mesh.userData.kabbalahNative3D = true;
	return mesh;
}

function geometry(kind) {
	if (!geometries.has(kind)) {
		const profile = profileFor(kind);
		const artifact = generateProceduralGeometry(
			profile.primitive,
			profile.parameters,
			[],
			{ id: `kabbalah_${kind}` }
		);
		geometries.set(kind, createNativeGeometryFromArtifact(artifact));
	}
	return geometries.get(kind);
}

function material(color, glow) {
	const key = `${color}:${glow}`;
	if (!materials.has(key)) {
		materials.set(key, createNativeWorldMaterial({
			name: `Kabbalah ${key}`,
			color: hexColor(color),
			roughness: 0.46,
			metalness: 0.08,
			emissiveStrength: glow,
			semanticRole: 'kabbalah-gameplay',
			userData: { sharedAsset: true }
		}));
	}
	return materials.get(key);
}

function profileFor(kind) {
	if (kind === 'sphere') {
		return { primitive: 'icosphere', parameters: { radius: 0.5, subdivisions: 1 } };
	}
	if (kind === 'ring') {
		return { primitive: 'torus', parameters: { majorRadius: 0.5, minorRadius: 0.12, majorSegments: 16, minorSegments: 6 } };
	}
	if (kind === 'bolt') {
		return { primitive: 'cylinder', parameters: { radius: 0.5, height: 1, radialSegments: 10 } };
	}
	return { primitive: 'cube', parameters: { size: 1 } };
}

function hexColor(value) {
	return `#${Number(value || 0xffffff).toString(16).padStart(6, '0').slice(-6)}`;
}
