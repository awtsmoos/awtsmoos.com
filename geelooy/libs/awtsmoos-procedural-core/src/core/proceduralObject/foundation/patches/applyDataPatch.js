// B"H

import { hashCanonicalValue } from "../canonical/index.js";
import { createDataPatch } from "./createDataPatch.js";
import { readDataPath, resolveDataParent } from "./dataPath.js";
import { cloneJsonData, freezeJsonData } from "./jsonData.js";

function equalData(left, right) {
	return hashCanonicalValue(left) === hashCanonicalValue(right);
}

function applyAtRoot(document, operation) {
	if (operation.op === "remove") throw new RangeError("Root document cannot be removed.");
	if (operation.op === "test") {
		if (!equalData(document, operation.value)) throw new Error("Patch test operation failed.");
		return document;
	}
	return cloneJsonData(operation.value);
}

function applyToArray(parent, key, operation) {
	if (!Number.isInteger(key) || key < 0) throw new TypeError("Array patch keys must be indexes.");
	if (operation.op === "add") {
		if (key > parent.length) throw new RangeError("Array add index exceeds length.");
		parent.splice(key, 0, cloneJsonData(operation.value));
		return;
	}
	if (key >= parent.length) throw new RangeError("Array patch index does not exist.");
	if (operation.op === "remove") parent.splice(key, 1);
	else if (operation.op === "replace") parent[key] = cloneJsonData(operation.value);
	else if (!equalData(parent[key], operation.value)) throw new Error("Patch test operation failed.");
}

function applyToObject(parent, key, operation) {
	if (typeof key !== "string") throw new TypeError("Object patch keys must be strings.");
	const exists = Object.hasOwn(parent, key);
	if (operation.op === "add") parent[key] = cloneJsonData(operation.value);
	else if (!exists) throw new RangeError("Object patch key does not exist.");
	else if (operation.op === "remove") delete parent[key];
	else if (operation.op === "replace") parent[key] = cloneJsonData(operation.value);
	else if (!equalData(parent[key], operation.value)) throw new Error("Patch test operation failed.");
}

/** Applies an ordered patch atomically to a cloned JSON-data document. */
export function applyDataPatch(documentInput, patchInput) {
	const original = freezeJsonData(cloneJsonData(documentInput));
	const patch = createDataPatch(patchInput);
	const baseHash = hashCanonicalValue(original);
	if (patch.expectedHash != null && patch.expectedHash !== baseHash) {
		throw new Error("Patch expectedHash does not match document.");
	}
	let document = cloneJsonData(original);
	for (const operation of patch.operations) {
		if (operation.path.length === 0) {
			document = applyAtRoot(document, operation);
			continue;
		}
		const { parent, key } = resolveDataParent(document, operation.path);
		if (operation.op === "test") {
			const found = readDataPath(document, operation.path);
			if (!found.exists || !equalData(found.value, operation.value)) throw new Error("Patch test operation failed.");
			continue;
		}
		if (Array.isArray(parent)) applyToArray(parent, key, operation);
		else applyToObject(parent, key, operation);
	}
	const result = freezeJsonData(document);
	return Object.freeze({
		document: result,
		baseHash,
		resultHash: hashCanonicalValue(result),
		patch
	});
}
