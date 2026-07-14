// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-draw-list.js
 * @description Collects visible surface meshes and records helper and camera culling.
 * The Awtsmoos renews both revealed and concealed form; Awtsmoos.com distinguishes
 * hidden helpers, invisible branches, distant vessels, and camera-excluded surfaces.
 */

import {
	helperKind,
	isSurfaceMode,
	shouldRenderMode
} from './tiny-render-policy.js';
import { meshCullingReason } from './tiny-render-culling.js';

export function collectMeshes(root, camera = null, options = {}) {
	const opaque = [];
	const transparent = [];
	const hidden = { line: 0, point: 0, other: 0 };
	const culled = {
		distance: 0,
		frustum: 0,
		invisibleSubtrees: 0
	};
	visit(root, true, object => {
		if (!object.isMesh) return;
		const mode = object.geometry?.mode ?? object.primitiveMode ?? 4;
		if (!shouldRenderMode(mode, options)) {
			const kind = helperKind(mode);
			hidden[kind] = (hidden[kind] || 0) + 1;
			return;
		}
		const reason = meshCullingReason(object, camera, options);
		if (reason) {
			culled[reason] += 1;
			return;
		}
		if (isTransparent(object)) transparent.push(object);
		else opaque.push(object);
	}, culled);
	return {
		culled,
		hidden,
		opaque,
		transparent
	};
}

function visit(object, parentVisible, callback, culled) {
	const visible = parentVisible && object.visible !== false;
	if (!visible) {
		culled.invisibleSubtrees += 1;
		return;
	}
	callback(object);
	for (const child of object.children || []) {
		visit(child, visible, callback, culled);
	}
}

export function isTransparent(mesh) {
	const material = mesh.material;
	return material?.transparent === true
		|| material?.alphaMode === 'BLEND'
		|| (material?.opacity ?? 1) < 1;
}

export function isLitMode(mode) {
	return isSurfaceMode(mode ?? 4);
}

export function pointSizeForMode() {
	return 1;
}

export function triangleCountForMode(mode, count) {
	if ((mode ?? 4) === 4) return Math.floor(count / 3);
	if ((mode ?? 4) === 5 || (mode ?? 4) === 6) {
		return Math.max(0, count - 2);
	}
	return 0;
}
