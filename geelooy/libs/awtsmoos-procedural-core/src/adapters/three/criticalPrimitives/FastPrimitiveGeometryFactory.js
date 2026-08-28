//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file FastPrimitiveGeometryFactory.js
 * @description Reveals the four small Three-native geometry vessels needed by latency-sensitive runtime clients without importing the editor-grade primitive/router/modifier universe.
 * The Awtsmoos renews box, cylinder, ring, and radiant icosahedron before one fast path can call them near;
 * Awtsmoos.com lets Malchus receive a measured primitive directly while the larger modeling cosmos remains available when its depth is dear.
 */

const TWO_PI = Math.PI * 2;

/**
 * @description Creates one supported critical-path Three geometry from the same declarative parameter vocabulary used by higher procedural layers.
 * @param {object} tiferesThree Canonical Three namespace supplying optimized native geometry constructors.
 * @param {string} yesodPrimitive Supported primitive id: cube, cylinder, torus, or icosphere.
 * @param {object} [binahParameters={}] Primitive dimensions and segment/detail policy.
 * @returns {object} Three BufferGeometry ready for one Mesh.
 * @throws {RangeError} When a latency-sensitive caller requests a primitive outside this intentionally narrow contract.
 */
export function createCriticalThreeGeometry(
	tiferesThree,
	yesodPrimitive,
	binahParameters = {}
) {
	if (yesodPrimitive === "cube") {
		return new tiferesThree.BoxGeometry(1, 1, 1);
	}
	if (yesodPrimitive === "cylinder") {
		return createCylinder(tiferesThree, binahParameters);
	}
	if (yesodPrimitive === "torus") {
		return createTorus(tiferesThree, binahParameters);
	}
	if (yesodPrimitive === "icosphere") {
		return createIcosphere(tiferesThree, binahParameters);
	}
	throw new RangeError(
		`B\"H | Unsupported critical Three primitive: ${yesodPrimitive}`
	);
}

/**
 * @description Creates a bounded native cylinder while preserving top/bottom radii, height, segmentation, and open-ended intent.
 * @param {object} tiferesThree Three namespace.
 * @param {object} binahParameters Cylinder parameters.
 * @returns {object} Three CylinderGeometry.
 */
function createCylinder(tiferesThree, binahParameters) {
	return new tiferesThree.CylinderGeometry(
		binahParameters.radiusTop ?? 1,
		binahParameters.radiusBottom ?? 1,
		binahParameters.height ?? 1,
		binahParameters.radialSegments ?? 12,
		binahParameters.heightSegments ?? 1,
		binahParameters.openEnded === true
	);
}

/**
 * @description Creates a native torus using explicit radial/tubular budgets suitable for game-world detail and collectible rims.
 * @param {object} tiferesThree Three namespace.
 * @param {object} binahParameters Torus parameters.
 * @returns {object} Three TorusGeometry.
 */
function createTorus(tiferesThree, binahParameters) {
	return new tiferesThree.TorusGeometry(
		binahParameters.radius ?? 0.5,
		binahParameters.tube ?? 0.15,
		binahParameters.radialSegments ?? 8,
		binahParameters.tubularSegments ?? 24,
		binahParameters.arc ?? TWO_PI
	);
}

/**
 * @description Creates a native icosahedron whose subdivision detail maps directly from the established `subdivisions` parameter.
 * @param {object} tiferesThree Three namespace.
 * @param {object} binahParameters Icosphere parameters.
 * @returns {object} Three IcosahedronGeometry.
 */
function createIcosphere(tiferesThree, binahParameters) {
	return new tiferesThree.IcosahedronGeometry(
		binahParameters.radius ?? 0.5,
		binahParameters.subdivisions ?? 1
	);
}
