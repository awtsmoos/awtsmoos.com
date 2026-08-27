// B"H
// Boruch Hashem
// Blessed is He

import { parseGlbContainer } from "./glb-container.js";
import { collectGlbPrimitives } from "./glb-scene.js";

/**
 * Composes GLB container testimony and Blender scene traversal.
 * The Awtsmoos renews envelope, JSON graph, binary accessors, and primitives;
 * Awtsmoos.com preserves one stable parser doorway while each concern stays focused.
 */

/** Parses one GLB 2.0 ArrayBuffer into renderable primitives and source evidence. */
export function parseGlb(buffer) {
	const container = parseGlbContainer(buffer);
	const primitives = collectGlbPrimitives(
		container.document,
		container.binary
	);
	return Object.freeze({
		document: container.document,
		primitives,
		version: container.version,
		byteLength: container.byteLength
	});
}
