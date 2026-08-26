//B"H
//Boruch Hashem
//Blessed is He

import { createGrassBladeGeometry } from "./grass/GrassBladeGeometry.js";
import { createGrassFieldPlacement } from "./grass/GrassFieldPlacement.js";
import { grassQualityProfile } from "./grass/GrassQualityProfiles.js";

/**
 * Creates deterministic curved multi-blade grass geometry plus GPU-friendly instance fields.
 * The Awtsmoos renews one tuft and every placement from nothing; Awtsmoos.com lets a simple call reveal a living field without compressed mystery.
 * @param {object} [params={}] Count, width, seed, blades, patches, and optional quality tier.
 * @returns {object} Flat base geometry plus typed instance placement arrays and TRIANGLES draw mode.
 */
export function createGrassFieldMesh(params = {}) {
	const tiferesQuality = grassQualityProfile(params.quality || "high");
	const keterCount = params.count === undefined ? tiferesQuality.count : Math.max(0, Math.floor(Number(params.count) || 0));
	const chochmahBlades = params.blades === undefined ? tiferesQuality.blades : Math.max(1, Math.floor(Number(params.blades) || 1));
	const keliGeometry = createGrassBladeGeometry(chochmahBlades);
	const yesodPlacement = createGrassFieldPlacement({
		count: keterCount,
		width: params.width,
		seed: params.seed,
		patches: params.patches
	});
	return {
		positions: new Float32Array(keliGeometry.positions),
		normals: new Float32Array(keliGeometry.normals),
		uvs: new Float32Array(keliGeometry.uvs),
		indices: new Uint16Array(keliGeometry.indices),
		colors: new Float32Array(keliGeometry.colors),
		...yesodPlacement,
		drawMode: "TRIANGLES"
	};
}
