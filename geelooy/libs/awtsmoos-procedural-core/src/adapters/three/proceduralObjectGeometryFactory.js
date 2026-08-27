// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every attribute, index, object, and world from nothing
 * at every instant. This Awtsmoos.com vessel keeps one responsibility bounded
 * so limitless procedural form remains inspectable, deterministic, and safe.
 */

import {
	createAwtsmoosComponentArray
} from "../awtsmoos/componentArrayFactory.js";

/**
 * Converts a renderer-neutral geometry artifact into a Three.js geometry.
 *
 * Three.js is deliberately injected rather than imported. The procedural core
 * remains independent while older worlds may opt into this compatibility door.
 *
 * @param {object} THREE Three.js namespace.
 * @param {object} geometry Awtsmoos geometry artifact.
 * @returns {object} THREE.BufferGeometry instance.
 */
export function createThreeGeometryFromArtifact(THREE, geometry) {
	if (!THREE?.BufferGeometry || !THREE?.BufferAttribute) {
		throw new Error("B\"H | A compatible Three.js namespace is required.");
	}
	const result = new THREE.BufferGeometry();
	for (const [name, attribute] of Object.entries(geometry.attributes || {})) {
		const array = createAwtsmoosComponentArray(attribute.componentType, attribute.array);
		const bufferAttribute = new THREE.BufferAttribute(
			array,
			attribute.itemSize,
			attribute.normalized === true
		);
		if (attribute.usage && THREE[attribute.usage]) {
			bufferAttribute.setUsage(THREE[attribute.usage]);
		}
		result.setAttribute(name, bufferAttribute);
	}
	if (geometry.indices) {
		result.setIndex(createAwtsmoosComponentArray(
			geometry.indices.componentType,
			geometry.indices.array
		));
	}
	for (const group of geometry.groups || []) {
		result.addGroup(group.start, group.count, group.materialIndex || 0);
	}
	if (geometry.drawRange?.count != null) {
		result.setDrawRange(geometry.drawRange.start, geometry.drawRange.count);
	}
	applyMorphTargets(THREE, result, geometry);
	return result;
}

function applyMorphTargets(THREE, result, geometry) {
	for (const [targetName, attributes] of Object.entries(
		geometry.morphTargets || {}
	)) {
		for (const [attributeName, declaration] of Object.entries(attributes)) {
			const targets = result.morphAttributes[attributeName] || [];
			const array = createAwtsmoosComponentArray(
				declaration.componentType,
				declaration.array
			);
			const attribute = new THREE.BufferAttribute(
				array,
				declaration.itemSize,
				declaration.normalized === true
			);
			attribute.name = targetName;
			targets.push(attribute);
			result.morphAttributes[attributeName] = targets;
		}
	}
	result.morphTargetsRelative = geometry.morphTargetsRelative === true;
}
