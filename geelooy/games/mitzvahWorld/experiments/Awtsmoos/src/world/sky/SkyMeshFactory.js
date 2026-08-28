//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SkyMeshFactory.js
 * @description Manifests sky geometry only when its material owns a genuine decoded remote image; geometry helpers live separately.
 * The Awtsmoos surrounds every horizon beyond texture and sphere; Awtsmoos.com lets geometry wait in concealment,
 * revealing no sky card, disc, or ray until truthful remote image light can inhabit the material vessel in fulfillment.
 */

import {
	BufferAttribute,
	BufferGeometry,
	Mesh,
	MeshStandardMaterial
} from '../../../../light-three-gltf/tiny-runtime.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isRealMaterialImage, materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import {
	skyDiscGeometry,
	skyQuadGeometry,
	skyRayGeometry
} from './SkyGeometryFactory.js';

/** Creates one remote-only sky mesh and hides it until a real image is bound. */
export function createSkyMesh(name, geometryData, materialData = {}) {
	const geometry = createGeometry(geometryData);
	const textureUrl = materialData.textureUrl || null;
	const cached = textureUrl ? cachedTextureImage(textureUrl) : null;
	const mapImage = realImage(materialData.mapImage) || realImage(cached);
	const material = new MeshStandardMaterial({
		alphaMode: materialData.alphaMode || (materialData.transparent ? 'BLEND' : 'OPAQUE'),
		color: materialData.color || [1, 1, 1, 1],
		doubleSided: materialData.doubleSided !== false,
		name: `${name}_material`,
		opacity: materialData.opacity ?? 1,
		transparent: Boolean(materialData.transparent)
	});
	Object.assign(material, {
		mapImage,
		mapRepeat: materialData.mapRepeat || [1, 1],
		texturePolicy: {
			...(materialData.texturePolicy || {}),
			realMapImage: Boolean(mapImage),
			remoteOnly: true,
			semanticRole: materialData.semanticRole || materialData.texturePolicy?.semanticRole || null
		},
		textureUrl
	});
	const mesh = new Mesh(geometry, material);
	mesh.name = name;
	prepareRemoteMaterialForHydration(mesh, material);
	mesh.visible = materialHasRealMap(material);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = { hiddenByCovenant: true, previousVisible: true };
	}
	return mesh;
}

/** Creates one remote-only sky quad. */
export function createSkyQuad(name, center, size, color, textureUrl = null, mapImage = null) {
	return createSkyMesh(name, skyQuadGeometry(center, size), {
		color,
		mapImage,
		textureUrl,
		transparent: true
	});
}

/** Creates one remote-only sky disc. */
export function createSkyDisc(name, center, radius, color, options = {}) {
	return createSkyMesh(name, skyDiscGeometry(center, radius, options.segments || 32), {
		...options,
		color
	});
}

/** Creates one remote-only sky ray. */
export function createSkyRay(name, center, angle, length, width, color) {
	return createSkyMesh(name, skyRayGeometry(center, angle, length, width), {
		color,
		transparent: true
	});
}

function createGeometry(data) {
	const geometry = new BufferGeometry();
	geometry.setAttribute('position', new BufferAttribute(new Float32Array(data.positions), 3));
	geometry.setAttribute('normal', new BufferAttribute(new Float32Array(data.normals), 3));
	geometry.setAttribute('uv', new BufferAttribute(new Float32Array(data.uvs), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array(data.indices), 1));
	return geometry;
}

function realImage(image) {
	return isRealMaterialImage(image) ? image : null;
}
