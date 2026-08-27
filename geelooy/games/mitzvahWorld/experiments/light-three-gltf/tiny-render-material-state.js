// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file tiny-render-material-state.js
 * @description Detects exact shader and surface-state continuity between adjacent draws.
 * The Awtsmoos renews every color and side without confusion; Awtsmoos.com compares
 * culling as well as uniforms so walls never inherit the preceding mesh's backface law.
 */

import {
	alphaModeCode,
	materialModeCode
} from './tiny-render-webgl-utils.js';
import { shouldCullBackfaces } from './tiny-render-surface-policy.js';
import { waterModeCode } from './tiny-water-material-mode.js';
import {
	isLitMode,
	pointSizeForMode
} from './tiny-render-draw-list.js';

export class RenderMaterialState {
	constructor() {
		this.previous = null;
		this.skips = 0;
		this.uploads = 0;
	}

	beginFrame(stats) {
		stats.materialStateSkips = 0;
		stats.materialStateUploads = 0;
		this.frameStats = stats;
	}

	needsUpload(mesh, buffers) {
		const next = snapshot(mesh, buffers);
		if (sameSnapshot(this.previous, next)) {
			this.skips += 1;
			this.frameStats.materialStateSkips += 1;
			return false;
		}
		this.previous = next;
		this.uploads += 1;
		this.frameStats.materialStateUploads += 1;
		return true;
	}
}

export function renderMaterialSnapshot(mesh, buffers = {}) {
	return snapshot(mesh, buffers);
}

function snapshot(mesh, buffers) {
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass;
	const mode = materialModeCode(mesh);
	return {
		alphaCutoff: material.alphaCutoff ?? 0.5,
		alphaMode: alphaModeCode(material),
		color0: color[0] ?? 0.75,
		color1: color[1] ?? 0.70,
		color2: color[2] ?? 0.62,
		color3: material.opacity ?? color[3] ?? 1,
		cullBackfaces: shouldCullBackfaces(mesh) ? 1 : 0,
		emissive: material.emissiveStrength ?? 1.8,
		lit: isLitMode(buffers.mode) ? 1 : 0,
		mode,
		pointSize: pointSizeForMode(buffers.mode),
		reactive: grass?.reactsToPlayer ? 1 : 0,
		radius: grass?.interactionRadius ?? 2.2,
		waterMode: waterModeCode(mesh),
		wind: grass?.windStrength ?? 0.085,
		windMode: mode === 2 ? 1 : 0
	};
}

function sameSnapshot(left, right) {
	if (!left) return false;
	for (const key of Object.keys(right)) {
		if (left[key] !== right[key]) return false;
	}
	return true;
}
