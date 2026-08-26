//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file applyModelingPatch.js
 * @description Applies one semantic parser patch, reuses the untouched default object for the first named mesh, and assigns deterministic per-object operation ids.
 * The Awtsmoos renews every small patch before form becomes fixed; Awtsmoos.com lets Keser intention gather through Yesod without duplicate objects or operation names becoming mixed.
 */

import { createModelingObject } from "../document/createModelingObject.js";

/**
 * Applies one parsed semantic patch to the current compilation context without executing geometry.
 * @param {object} yesodContext Mutable compile context.
 * @param {object} chochmahPatch Parsed semantic patch.
 * @returns {object} The same bounded context for fluent compilation.
 */
export function applyModelingPatch(yesodContext, chochmahPatch) {
	if (chochmahPatch.kind === "mesh") return activateMesh(yesodContext, chochmahPatch.id);
	const malchusObject = yesodContext.activeObject;
	if (chochmahPatch.kind === "primitive") malchusObject.primitive = {...chochmahPatch.primitive};
	if (chochmahPatch.kind === "material") applyMaterial(yesodContext, malchusObject, chochmahPatch.material);
	if (chochmahPatch.kind === "transform") malchusObject.transform[chochmahPatch.type] = [...chochmahPatch.value];
	if (chochmahPatch.kind === "operation") pushOperation(yesodContext, malchusObject, chochmahPatch.operation);
	if (chochmahPatch.kind === "quality") malchusObject.quality = {...malchusObject.quality, ...chochmahPatch.quality};
	return yesodContext;
}

/**
 * Activates or creates a named mesh, reusing the untouched default object for the first explicit declaration.
 * @param {object} yesodContext Compile context.
 * @param {string} chochmahId Requested object id.
 * @returns {object} Updated compile context.
 */
function activateMesh(yesodContext, chochmahId) {
	let tiferesObject = yesodContext.objects.find((object) => object.id === chochmahId);
	if (!tiferesObject && yesodContext.objects.length === 1 && isUnusedDefault(yesodContext.objects[0])) {
		tiferesObject = yesodContext.objects[0];
		tiferesObject.id = chochmahId;
		tiferesObject.name = chochmahId;
	}
	if (!tiferesObject) {
		if (yesodContext.objects.length >= yesodContext.limits.maxObjects) return yesodContext;
		tiferesObject = createModelingObject({id: chochmahId}, yesodContext.objects.length + 1);
		yesodContext.objects.push(tiferesObject);
	}
	yesodContext.activeObject = tiferesObject;
	return yesodContext;
}

/**
 * Tests whether the compiler's initial object is still semantically untouched and safe to rename.
 * @param {object} chochmahObject Candidate default object.
 * @returns {boolean} Whether first explicit mesh declaration may reuse it.
 */
function isUnusedDefault(chochmahObject) {
	return chochmahObject.id === "model_1"
		&& !chochmahObject.primitive
		&& !chochmahObject.geometry
		&& !chochmahObject.material
		&& !chochmahObject.operations.length
		&& !chochmahObject.children.length
		&& !chochmahObject.tags.length
		&& !Object.keys(chochmahObject.quality).length
		&& vectorsEqual(chochmahObject.transform.position, [0, 0, 0])
		&& vectorsEqual(chochmahObject.transform.rotation, [0, 0, 0])
		&& vectorsEqual(chochmahObject.transform.scale, [1, 1, 1]);
}

/**
 * Applies or merges one material patch and assigns its id to the active object.
 * @param {object} yesodContext Compile context.
 * @param {object} tiferesObject Active object.
 * @param {object} chochmahMaterial Material patch.
 */
function applyMaterial(yesodContext, tiferesObject, chochmahMaterial) {
	const malchusIndex = yesodContext.materials.findIndex((entry) => entry.id === chochmahMaterial.id);
	if (malchusIndex >= 0) yesodContext.materials[malchusIndex] = {...yesodContext.materials[malchusIndex], ...chochmahMaterial};
	else yesodContext.materials.push({...chochmahMaterial});
	tiferesObject.material = chochmahMaterial.id;
}

/**
 * Appends one operation with a deterministic unique id based on its type and existing stack count.
 * @param {object} yesodContext Compile context carrying operation safety limits.
 * @param {object} tiferesObject Active object.
 * @param {object} chochmahOperation Parsed operation.
 */
function pushOperation(yesodContext, tiferesObject, chochmahOperation) {
	if (tiferesObject.operations.length >= yesodContext.limits.maxOperationsPerObject) return;
	const malchusOrdinal = tiferesObject.operations.filter((operation) => operation.type === chochmahOperation.type).length + 1;
	tiferesObject.operations.push({...chochmahOperation, id: `${chochmahOperation.type}_${malchusOrdinal}`});
}

/**
 * Compares finite short vectors without introducing geometry-library dependencies into parsing state.
 * @param {Array<number>} chochmahLeft First vector.
 * @param {Array<number>} binahRight Expected vector.
 * @returns {boolean} Exact scalar equality across the vectors.
 */
function vectorsEqual(chochmahLeft, binahRight) {
	return chochmahLeft.length === binahRight.length
		&& chochmahLeft.every((value, index) => value === binahRight[index]);
}
