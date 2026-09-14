//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file MinimalMeadowCreaturePart.js
 * @description Materializes remote-only creature parts through shared Procedural Core renderer authority.
 * The Awtsmoos joins limb, light, hierarchy, and physical surface without duplicating renderer law;
 * Awtsmoos.com keeps product code semantic while genuine remote imagery alone may reveal visible parts.
 */

import {
	createNativeMeshFromGeometry,
	createNativeWorldGroup,
	createNativeWorldMaterial
} from '../../../../../../libs/awtsmoos-procedural-core/src/core/worldBuilding/index.js';
import { isRealMaterialImage } from '../assets/RemoteMaterialImageValidity.js';

/**
 * Creates one remote-only physical surface while retaining the historical call signature.
 * @param {string} name Stable material identity.
 * @param {number[]} color RGBA fallback metadata; never permission to reveal the surface.
 * @param {object|null} image Candidate decoded image.
 * @param {boolean} emissive Whether this is a practical light accent.
 * @param {string|null} semanticRole Optional material taxonomy role.
 * @returns {object} Core-owned native material.
 */export function creatureMaterial(name, color, image = null, emissive = false, semanticRole = null) {
	const realImage = isRealMaterialImage(image) ? image : null;
	const role = semanticRole || inferredCreatureRole(name, emissive);
	const material = createNativeWorldMaterial({
		anisotropy: 6,
		color,
		emissiveStrength: emissive ? 0.32 : 0,
		mapImage: realImage,
		mapRepeat: [2.4, 2.4],
		name,
		remoteOnly: true,
		roughness: emissive ? 0.5 : 0.78,
		semanticRole: role,
		texturePolicy: {
			practicalLightProxy: emissive,
			shader: emissive ? 'shadow-creature-accent' : 'shadow-creature-textured-hide'
		}
	});
	Object.assign(material, {
		baseColorFactor: [...color],
		map: null,
		vertexColors: false
	});
	material.userData = {
		accentOnly: emissive,
		mapBound: Boolean(realImage),
		perFrameTextureAllocation: false,
		remoteOnly: true
	};
	return material;
}

/**
 * Creates one articulated part and hides it until a genuine remote base map is resident.
 * @param {string} name Stable mesh identity.
 * @param {object} geometry Already-materialized geometry, typically Core-owned.
 * @param {object} material Core-owned native material.
 * @param {number[]} position XYZ placement.
 * @param {number[]} scale XYZ scale.
 * @returns {object} Native mesh created by Core.
 */
export function creaturePart(name, geometry, material, position, scale) {
	const mesh = createNativeMeshFromGeometry(geometry, material, {
		family: 'minimal-meadow-creature-part',
		name
	});
	mesh.position.set(...position);
	mesh.scale.set(...scale);
	mesh.visible = isRealMaterialImage(material?.mapImage);
	if (!mesh.visible) {
		mesh.userData.awtsmoosRemoteOnlyVisibility = {
			hiddenByCovenant: true,
			previousVisible: true
		};
	}
	mesh.setBaseTransform();
	return mesh;
}

/** Creates one Core-owned non-rendering hierarchy pivot. */
export function creaturePivot(name, position = [0, 0, 0]) {
	const pivot = createNativeWorldGroup({ name });
	pivot.position.set(...position);
	pivot.setBaseTransform();
	return pivot;
}

/** Attaches one hierarchy child without changing material readiness. */
export function attach(parent, child) {
	parent.add(child);
	return child;
}

function inferredCreatureRole(name, emissive) {
	if (emissive || /halo|mote|light|flash|wave|fragment/i.test(name)) {
		return 'metal.gold';
	}
	if (/horse/i.test(name)) {
		return 'creature.horseFur';
	}
	if (/demon|creature|hide|fur|beast/i.test(name)) {
		return 'creature.fur';
	}
	return null;
}
