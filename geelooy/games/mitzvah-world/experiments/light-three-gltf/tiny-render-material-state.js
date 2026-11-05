//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file tiny-render-material-state.js
 * @description Detects exact shader and surface-state continuity between adjacent draws, including living vegetation state.
 * The Awtsmoos renews every color, current, gust, and side without confusion; Awtsmoos.com compares
 * all visible per-draw truths so grass receives fresh motion while stable walls avoid redundant GPU uploads.
 *
 * The comparison vessels are two reusable snapshot objects owned by the state:
 * each draw writes its truths into the candidate vessel and, only when an upload
 * is truly owed, copies them into the stored vessel that `previous` names. No
 * per-draw snapshot allocation reaches the garbage collector, while every field
 * compared is exactly the field the historic allocating snapshot compared, so
 * upload/skip decisions are identical by construction. `previous` is a living
 * vessel (its contents advance on the next upload), never a frozen record.
 * A vessel is born by writing the empty-mesh snapshot, so its shape and field
 * order are the snapshot's own by construction.
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
		this.candidate = createSnapshotVessel();
		this.stored = createSnapshotVessel();
	}

	beginFrame(stats) {
		stats.materialStateSkips = 0;
		stats.materialStateUploads = 0;
		this.frameStats = stats;
	}

	needsUpload(mesh, buffers) {
		writeSnapshot(this.candidate, mesh, buffers);
		if (this.previous && sameSnapshot(this.previous, this.candidate)) {
			this.skips += 1;
			this.frameStats.materialStateSkips += 1;
			return false;
		}
		copySnapshot(this.stored, this.candidate);
		this.previous = this.stored;
		this.uploads += 1;
		this.frameStats.materialStateUploads += 1;
		return true;
	}
}

export function renderMaterialSnapshot(mesh, buffers = {}) {
	const vessel = createSnapshotVessel();
	writeSnapshot(vessel, mesh, buffers);
	return vessel;
}

function createSnapshotVessel() {
	return writeSnapshot({}, {}, { mode: 4 });
}

function writeSnapshot(target, mesh, buffers) {
	const material = mesh.material || {};
	const color = material.color || [0.75, 0.70, 0.62, 1];
	const grass = mesh.userData?.AwtsmoosYardGrass || {};
	const mode = materialModeCode(mesh);
	target.alphaCutoff = material.alphaCutoff ?? 0.5;
	target.alphaMode = alphaModeCode(material);
	target.color0 = color[0] ?? 0.75;
	target.color1 = color[1] ?? 0.70;
	target.color2 = color[2] ?? 0.62;
	target.color3 = material.opacity ?? color[3] ?? 1;
	target.cullBackfaces = shouldCullBackfaces(mesh) ? 1 : 0;
	target.emissive = material.emissiveStrength ?? 1.8;
	target.grassDirectionX = grass.windDirectionX ?? 0.72;
	target.grassDirectionZ = grass.windDirectionZ ?? 0.69;
	target.grassFlutter = grass.windFlutter ?? 0;
	target.grassGust = grass.windGust ?? 0.5;
	target.grassReaction = grass.playerReaction ?? 0;
	target.grassReactive = grass.reactsToPlayer ? 1 : 0;
	target.grassRadius = grass.interactionRadius ?? 2.2;
	target.grassWetness = grass.wetness ?? 0;
	target.grassWind = grass.windStrength ?? (mode === 2 ? 0.055 : 0);
	target.lit = isLitMode(buffers.mode) ? 1 : 0;
	target.mode = mode;
	target.pointSize = pointSizeForMode(buffers.mode);
	target.waterMode = waterModeCode(mesh);
	target.windMode = mode === 2 ? 1 : 0;
	return target;
}

function copySnapshot(target, source) {
	for (const key of Object.keys(source)) {
		target[key] = source[key];
	}
	return target;
}

function sameSnapshot(left, right) {
	if (!left) return false;
	for (const key of Object.keys(right)) {
		if (left[key] !== right[key]) return false;
	}
	return true;
}
