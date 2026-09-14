//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file SkyMeshFactory.js
 * @description Preserves legacy MitzvahWorld remote-sky-card signatures while Procedural Core owns native mesh and material creation.
 * MitzvahWorld may still describe a semantic card, disc, or ray, but it no longer constructs renderer geometry or materials;
 * trusted remote-image visibility remains a game provenance decision until every legacy caller has migrated to Core atmosphere APIs.
 */
import {
	createNativeGeometryMesh,
	createNativeWorldMaterial
} from '../../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { cachedTextureImage } from '../../assets/PublicMaterialCache.js';
import { isRealMaterialImage, materialHasRealMap } from '../../assets/RemoteMaterialImageValidity.js';
import { prepareRemoteMaterialForHydration } from '../../assets/RemoteMaterialReadiness.js';
import {
	skyDiscGeometry,
	skyQuadGeometry,
	skyRayGeometry
} from './SkyGeometryFactory.js';

/**
 * Create one legacy semantic sky surface through Core-owned native materialization.
 * @param {string} name Stable compatibility identity.
 * @param {object} geometryData Portable indexed geometry.
 * @param {object} materialData Trusted remote-image and appearance metadata.
 * @returns {object} Core-created mesh hidden until real remote imagery is bound.
 */
export function createSkyMesh(name, geometryData, materialData = {}) {
	const textureUrl = materialData.textureUrl || null;
	const cached = textureUrl ? cachedTextureImage(textureUrl) : null;
	const mapImage = realImage(materialData.mapImage) || realImage(cached);	const material = createNativeWorldMaterial({
		alphaMode: materialData.alphaMode || (materialData.transparent ? 'BLEND' : 'OPAQUE'),
		color: materialData.color || [1, 1, 1, 1],
		doubleSided: materialData.doubleSided !== false,
		mapImage,
		mapRepeat: materialData.mapRepeat || [1, 1],
		name: `${name}_material`,
		opacity: materialData.opacity ?? 1,
		remoteOnly: true,
		semanticRole: materialData.semanticRole || materialData.texturePolicy?.semanticRole || null,
		texturePolicy: materialData.texturePolicy,
		textureUrl,
		transparent: Boolean(materialData.transparent)
	});
	const mesh = createNativeGeometryMesh(geometryData, material, {
		family: 'legacy-remote-sky-surface',
		name
	});
	prepareRemoteMaterialForHydration(mesh, material);
	mesh.visible = materialHasRealMap(material);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = {
			hiddenByCovenant: true,
			previousVisible: true
		};
	}
	return mesh;
}

/** Creates one compatibility sky quad from renderer-neutral geometry data. */
export function createSkyQuad(name, center, size, color, textureUrl = null, mapImage = null) {
	return createSkyMesh(name, skyQuadGeometry(center, size), {
		color,
		mapImage,
		textureUrl,
		transparent: true
	});
}
/** Creates one compatibility sky disc from renderer-neutral geometry data. */
export function createSkyDisc(name, center, radius, color, options = {}) {
	return createSkyMesh(name, skyDiscGeometry(center, radius, options.segments || 32), {
		...options,
		color
	});
}

/** Creates one compatibility sky ray from renderer-neutral geometry data. */
export function createSkyRay(name, center, angle, length, width, color) {
	return createSkyMesh(name, skyRayGeometry(center, angle, length, width), {
		color,
		transparent: true
	});
}

/** Apply the same remote-material validity gate used by every other MitzvahWorld surface. */
function realImage(image) {
	return isRealMaterialImage(image) ? image : null;
}
