// B"H

import { createStableId } from "../artifacts/index.js";
import { hashCanonicalValue } from "../canonical/index.js";
import { normalizeDataPath } from "./dataPath.js";
import { normalizeJsonData } from "./jsonData.js";

const PATCH_OPERATIONS = Object.freeze(["add", "replace", "remove", "test"]);
const HASH_PATTERN = /^[a-z0-9-]+:[0-9a-f]+$/i;

function normalizeOperation(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Patch operation must be an object.");
	}
	if (!PATCH_OPERATIONS.includes(input.op)) {
		throw new TypeError(`Unsupported patch operation: ${input.op}`);
	}
	const path = normalizeDataPath(input.path ?? []);
	const needsValue = input.op !== "remove";
	if (needsValue && !Object.hasOwn(input, "value")) {
		throw new TypeError(`Patch operation ${input.op} requires value.`);
	}
	if (!needsValue && Object.hasOwn(input, "value")) {
		throw new TypeError("Patch remove operation cannot contain value.");
	}
	return Object.freeze({
		op: input.op,
		path,
		...(needsValue ? { value: normalizeJsonData(input.value) } : {})
	});
}

/** Creates a content-addressed ordered JSON-data patch. */
export function createDataPatch(input) {
	if (!input || typeof input !== "object" || Array.isArray(input)) {
		throw new TypeError("Data patch input must be an object.");
	}
	if (!Array.isArray(input.operations)) throw new TypeError("Data patch operations must be an array.");
	if (input.expectedHash != null && !HASH_PATTERN.test(input.expectedHash)) {
		throw new TypeError("Data patch expectedHash is malformed.");
	}
	const operations = Object.freeze(input.operations.map(normalizeOperation));
	const content = Object.freeze({ expectedHash: input.expectedHash ?? null, operations });
	const contentHash = hashCanonicalValue(content);
	return Object.freeze({
		patchSchema: "awtsmoos.data-patch",
		id: input.id ?? createStableId("patch", content),
		contentHash,
		...content
	});
}

export { PATCH_OPERATIONS };
