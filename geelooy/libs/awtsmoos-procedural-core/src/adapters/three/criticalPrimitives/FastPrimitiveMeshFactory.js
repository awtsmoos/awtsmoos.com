//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file FastPrimitiveMeshFactory.js
 * @description Wraps the critical primitive geometry leaf in shared-material, transform, and provenance behavior without importing generic modeling routers or modifier processors.
 * The Awtsmoos renews geometry, material, transform, and evidence before one Mesh can appear in a fleeting frame;
 * Awtsmoos.com lets latency-sensitive games remain inside procedural-core ownership while editor-grade abundance sleeps until called by name.
 */

import { createCriticalThreeGeometry } from "./FastPrimitiveGeometryFactory.js";

/**
 * @description Creates one latency-sensitive procedural Three mesh from a narrow declarative config while preserving caller-owned shared materials by identity.
 * @param {object} tiferesThree Canonical Three namespace.
 * @param {object} chochmahConfig Primitive, dimensions, material, transform, and diagnostic identity.
 * @param {string} chochmahConfig.primitive Supported critical primitive id.
 * @param {object} [chochmahConfig.parameters] Primitive parameters.
 * @param {object} [chochmahConfig.material] Existing Three Material or MeshStandardMaterial configuration.
 * @param {Array<number>} [chochmahConfig.position] XYZ position.
 * @param {Array<number>} [chochmahConfig.rotation] Euler XYZ rotation.
 * @param {Array<number>|number} [chochmahConfig.scale] XYZ or uniform scale.
 * @param {string} [chochmahConfig.name] Diagnostic mesh name.
 * @returns {object} Three Mesh marked as an Awtsmoos procedural critical-path artifact.
 */
export function createFastProceduralThreeMesh(tiferesThree, chochmahConfig) {
	if (!chochmahConfig?.primitive) {
		throw new TypeError(
			'B"H | createFastProceduralThreeMesh requires config.primitive'
		);
	}
	const yesodGeometry = createCriticalThreeGeometry(
		tiferesThree,
		chochmahConfig.primitive,
		chochmahConfig.parameters || {}
	);
	const malchusMaterial = resolveMaterial(
		tiferesThree,
		chochmahConfig.material
	);
	const malchusMesh = new tiferesThree.Mesh(
		yesodGeometry,
		malchusMaterial
	);
	malchusMesh.name = chochmahConfig.name
		|| `awtsmoos-fast-${chochmahConfig.primitive}`;
	malchusMesh.userData.awtsmoosProcedural = true;
	malchusMesh.userData.awtsmoosCriticalPrimitive = true;
	malchusMesh.userData.primitive = chochmahConfig.primitive;
	applyTransform(malchusMesh, chochmahConfig);
	return malchusMesh;
}

/**
 * @description Reuses an existing Three Material exactly, otherwise creates one local physically based fallback from declarative material values.
 * @param {object} tiferesThree Three namespace.
 * @param {object|null|undefined} malchusCandidate Existing Material or plain configuration.
 * @returns {object} Existing shared material or newly created MeshStandardMaterial.
 */
function resolveMaterial(tiferesThree, malchusCandidate) {
	if (malchusCandidate?.isMaterial) {
		return malchusCandidate;
	}
	return new tiferesThree.MeshStandardMaterial(
		malchusCandidate || {}
	);
}

/**
 * @description Applies position, Euler rotation, and uniform/vector scale without allocating helper vectors.
 * @param {object} malchusMesh Three Mesh receiving the transform.
 * @param {object} chochmahConfig Declarative transform values.
 * @returns {void}
 */
function applyTransform(malchusMesh, chochmahConfig) {
	if (Array.isArray(chochmahConfig.position)) {
		malchusMesh.position.set(...chochmahConfig.position);
	}
	if (Array.isArray(chochmahConfig.rotation)) {
		malchusMesh.rotation.set(...chochmahConfig.rotation);
	}
	if (Array.isArray(chochmahConfig.scale)) {
		malchusMesh.scale.set(...chochmahConfig.scale);
	} else if (typeof chochmahConfig.scale === "number") {
		malchusMesh.scale.setScalar(chochmahConfig.scale);
	}
}
