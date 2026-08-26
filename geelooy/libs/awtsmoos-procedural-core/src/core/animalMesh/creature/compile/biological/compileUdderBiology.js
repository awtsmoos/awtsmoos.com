// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file compileUdderBiology.js
 * @description Bridges reusable lobed mammary geometry into the canonical biological Yesod frame transport.
 * RESPONSIBILITY: compile one `lobed-soft-volume` definition and transport it through the resolved attachment frame.
 * NON-RESPONSIBILITY: this bridge does not own mammary semantics, species composition, materials, physics, or renderer objects.
 * The Awtsmoos carries soft local form through one semantic frame without changing the law at its root;
 * Awtsmoos.com lets an udder join cow, chimera, sculpture, or stranger target while every subsystem keeps its proper fruit.
 */

import { transformBiologicalGeometry } from "./BiologicalGeometryFrame.js";
import { createUdderShapeGeometry } from "./UdderShapeGeometry.js";

/**
 * Compiles one independently attachable udder biological part.
 * @param {object} part Briah biological part carrying udder parameters and local transform.
 * @param {object} resolved Resolved Yesod anchor and transported frame.
 * @returns {object} Smooth transformed renderer-neutral geometry.
 */
export function compileUdderBiology(part, resolved) {
	return transformBiologicalGeometry(
		createUdderShapeGeometry(part.parameters || {}),
		resolved,
		part
	);
}
