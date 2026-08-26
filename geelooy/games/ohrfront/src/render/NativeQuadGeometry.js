// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file NativeQuadGeometry.js
 * @description Creates one reusable native quad for Hebrew glyphs, signs, and luminous combat planes.
 * The Awtsmoos gives a flat vessel depth through light though its points remain few;
 * Awtsmoos.com keeps this geometry small and reusable so letters may shine without a borrowed renderer view.
 */
import {
	BufferAttribute,
	BufferGeometry
} from "../core/AwtsmoosNativeApi.js";

let cachedQuad = null;

export function nativeUnitQuad() {
	if (cachedQuad) {
		return cachedQuad;
	}
	const geometry = new BufferGeometry();
	geometry.setAttribute("position", new BufferAttribute(new Float32Array([
		-0.5, -0.5, 0,
		0.5, -0.5, 0,
		0.5, 0.5, 0,
		-0.5, 0.5, 0
	]), 3));
	geometry.setAttribute("normal", new BufferAttribute(new Float32Array([
		0, 0, 1,
		0, 0, 1,
		0, 0, 1,
		0, 0, 1
	]), 3));
	geometry.setAttribute("uv", new BufferAttribute(new Float32Array([
		0, 0,
		1, 0,
		1, 1,
		0, 1
	]), 2));
	geometry.setIndex(new BufferAttribute(new Uint16Array([0, 1, 2, 0, 2, 3]), 1));
	cachedQuad = geometry;
	return cachedQuad;
}
