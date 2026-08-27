// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-collection.js
 * @description Traverses visible hierarchy and separates safe batch candidates.
 * The Awtsmoos knows every visible and hidden branch; Awtsmoos.com gathers only lawful
 * surfaces while preserving transparent order and leaving uncertain forms untouched.
 */

import {
	helperKind,
	shouldRenderMode
} from './tiny-render-policy.js';
import { isTransparent } from './tiny-render-surface-policy.js';
import { staticBatchMetadata } from './tiny-static-batch-policy.js';

export function collectSceneMeshes(root, options = {}) {
	const result = {
		batchCandidates: [],
		hidden: { line: 0, point: 0, other: 0 },
		invisibleSubtrees: 0,
		opaque: [],
		transparent: []
	};
	visit(root, true, object => classify(object, options, result), result);
	return result;
}

function classify(object, options, result) {
	if (!object.isMesh) return;
	const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;
	if (!shouldRenderMode(mode, options)) {
		const kind = helperKind(mode);
		result.hidden[kind] = (result.hidden[kind] || 0) + 1;
		return;
	}
	if (isTransparent(object)) {
		result.transparent.push(object);
		return;
	}
	const metadata = options.staticBatcher
		? staticBatchMetadata(object)
		: null;
	if (metadata) {
		result.batchCandidates.push({ mesh: object, metadata });
		return;
	}
	result.opaque.push(object);
}

function visit(object, parentVisible, callback, result) {
	const visible = parentVisible && object.visible !== false;
	if (!visible) {
		result.invisibleSubtrees += 1;
		return;
	}
	callback(object);
	for (const child of object.children || []) {
		visit(child, visible, callback, result);
	}
}
