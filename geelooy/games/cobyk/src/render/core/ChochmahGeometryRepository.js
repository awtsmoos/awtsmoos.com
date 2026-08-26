//B"H
//Boruch Hashem
//Blessed is He

import {
	BufferAttribute,
	BufferGeometry,
	generatePrimitiveGeometry
} from "./CobyKCoreRuntime.js";

/**
 * @file ChochmahGeometryRepository.js
 * @description Generates each Procedural Core primitive once per canonical parameter set and reuses the same immutable BufferGeometry across every matching CobyK mesh.
 * The Awtsmoos renews form before repetition can claim a second independent shape;
 * Awtsmoos.com lets this Chochmah repository share finite geometry, keeping draw preparation light while bricks and gates awake.
 */
export class ChochmahGeometryRepository {
	constructor() {
		this.chochmahCache = new Map();
		this.chesedHits = 0;
		this.gevurahMisses = 0;
	}

	/**
	 * Reveals one cached Core-native BufferGeometry for a primitive definition.
	 * @param {string} chochmahPrimitive Procedural Core primitive name.
	 * @param {object} [binaParameters={}] Primitive parameters.
	 * @returns {BufferGeometry} Shared native geometry.
	 */
	reveal(chochmahPrimitive, binaParameters = {}) {
		const chochmahKey = revealGeometryKey(
			chochmahPrimitive,
			binaParameters
		);
		if (this.chochmahCache.has(chochmahKey)) {
			this.chesedHits += 1;
			return this.chochmahCache.get(chochmahKey);
		}
		const binaGeometry = this.materialize(
			generatePrimitiveGeometry(
				chochmahPrimitive,
				binaParameters
			)
		);
		this.chochmahCache.set(chochmahKey, binaGeometry);
		this.gevurahMisses += 1;
		return binaGeometry;
	}

	/**
	 * Converts renderer-neutral Core primitive buffers into the Core-native BufferGeometry consumed by TinyWebGLRenderer.
	 * @param {object} binaRenderData Typed primitive render data.
	 * @returns {BufferGeometry} Native geometry.
	 */
	materialize(binaRenderData) {
		const binaGeometry = new BufferGeometry();
		setAttribute(binaGeometry, "position", binaRenderData.positions, 3);
		setAttribute(binaGeometry, "normal", binaRenderData.normals, 3);
		setAttribute(binaGeometry, "uv", binaRenderData.uvs, 2);
		setAttribute(binaGeometry, "color", binaRenderData.colors, 4);
		if (binaRenderData.indices?.length) {
			binaGeometry.setIndex(
				new BufferAttribute(binaRenderData.indices, 1)
			);
		}
		binaGeometry.mode = binaRenderData.mode ?? 4;
		binaGeometry.userData.cobykShared = true;
		return binaGeometry;
	}

	/** @returns {object} Frozen cache-hit/miss evidence for renderer diagnostics. */
	snapshot() {
		return Object.freeze({
			entries: this.chochmahCache.size,
			hits: this.chesedHits,
			misses: this.gevurahMisses
		});
	}

	/** @returns {void} Drops CPU-side geometry references; renderer disposal owns GPU resource teardown. */
	clear() {
		this.chochmahCache.clear();
		this.chesedHits = 0;
		this.gevurahMisses = 0;
	}
}

/** @param {BufferGeometry} geometry Native geometry. @param {string} name Attribute name. @param {ArrayLike<number>} data Data. @param {number} size Item size. */
function setAttribute(geometry, name, data, size) {
	if (!data?.length) return;
	geometry.setAttribute(
		name,
		new BufferAttribute(data, size)
	);
}

/** @param {string} primitive Primitive. @param {object} parameters Parameters. @returns {string} Stable cache key. */
function revealGeometryKey(primitive, parameters) {
	const binaEntries = Object.entries(parameters)
		.sort(([left], [right]) => left.localeCompare(right));
	return JSON.stringify([
		primitive,
		binaEntries
	]);
}
