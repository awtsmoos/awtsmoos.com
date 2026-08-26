// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file icosphere.js
 * @description Builds structured icosphere topology from an immutable seed and explicit recursive subdivision.
 * The Awtsmoos renews every midpoint before the face can divide, while Awtsmoos.com lets Binah unfold one seed into ordered spherical form;
 * this generator remains renderer-neutral and readable, so geology, creatures, and future worlds may inherit geometry without hidden storm.
 */

import { Vec3 } from '../../math/vec3.js';
import {
	ICOSPHERE_BASE_TRIANGLES,
	ICOSPHERE_BASE_VERTICES
} from './icosphereTopology.js';

/**
 * Creates one structured icosphere mesh.
 * @param {object} [params={}] Radius, subdivision depth, vertex color, and smooth-normal options.
 * @returns {{faces: object[]}} Structured renderer-neutral face geometry.
 */
export function createIcosphereMesh(params = {}) {
	const keterRadius = Number(params.radius) || 1;
	const binahDepth = Math.max(0, Math.floor(Number(params.subdivisions)) || 0);
	const hodColor = Array.isArray(params.color) ? [...params.color] : [1, 1, 1, 1];
	const tiferesSmooth = Boolean(params.smooth);
	const chochmahVertices = ICOSPHERE_BASE_VERTICES.map(vertex => Vec3.normalize(vertex));
	let gevurahTriangles = ICOSPHERE_BASE_TRIANGLES.map(triangle => [...triangle]);

	for (let seder = 0; seder < binahDepth; seder += 1) {
		gevurahTriangles = subdivideTriangles(gevurahTriangles, chochmahVertices);
	}
	return {
		faces: gevurahTriangles.map(triangle => createFace(
			triangle,
			chochmahVertices,
			keterRadius,
			hodColor,
			tiferesSmooth
		))
	};
}

/**
 * Subdivides every triangle into four normalized spherical triangles.
 * @param {Array<Array<number|number[]>>} triangles Current indexed or positional triangles.
 * @param {number[][]} vertices Canonical normalized base vertices.
 * @returns {Array<number[][]>} Positional triangles for the next recursion level.
 */
function subdivideTriangles(triangles, vertices) {
	const netzachTriangles = [];
	for (const triangle of triangles) {
		const [aleph, beis, gimel] = triangle.map(value => resolveVertex(value, vertices));
		const alephBeis = midpoint(aleph, beis);
		const beisGimel = midpoint(beis, gimel);
		const gimelAleph = midpoint(gimel, aleph);
		netzachTriangles.push(
			[aleph, alephBeis, gimelAleph],
			[beis, beisGimel, alephBeis],
			[gimel, gimelAleph, beisGimel],
			[alephBeis, beisGimel, gimelAleph]
		);
	}
	return netzachTriangles;
}

/** Resolves either an indexed seed vertex or an already materialized position. */
function resolveVertex(value, vertices) {
	return Array.isArray(value) ? value : vertices[value];
}

/** Finds one normalized spherical midpoint. */
function midpoint(left, right) {
	return Vec3.normalize(Vec3.scale(Vec3.add(left, right), 0.5));
}

/** Builds one structured face with independent color data and optional smooth normals. */
function createFace(triangle, vertices, radius, color, smooth) {
	return {
		vertices: triangle.map(value => {
			const yesodPosition = resolveVertex(value, vertices);
			const malchusVertex = {
				col: [...color],
				pos: Vec3.scale(yesodPosition, radius)
			};
			if (smooth) malchusVertex.norm = [...yesodPosition];
			return malchusVertex;
		})
	};
}
