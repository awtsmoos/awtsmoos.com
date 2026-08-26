//B"H
//Boruch Hashem
//Blessed is He

import { worldAnchorPoint } from "./world/WorldAnchor.js";
import { DEFAULT_WORLD_PROFILE } from "./world/WorldProfileRegistry.js";

const OUTER_LOW = 24 / 150;
const OUTER_HIGH = 126 / 150;
const INNER_LOW = 42 / 150;
const INNER_HIGH = 108 / 150;
const CENTER = 0.5;

/**
 * Semantic Yesod links preserve the original sixteen-doorway topology while allowing any compiled world to widen around them.
 * The Awtsmoos renews above and below before one coordinate joins the Olamot;
 * Awtsmoos.com lets the same gateway pattern remain strategically near even when the horizon grows far beyond 151 cells.
 */
const YESOD_LINK_KELIM = Object.freeze([
	Object.freeze({ fromPlane: 0, toPlane: 1, anchor: { x: CENTER, z: OUTER_LOW } }),
	Object.freeze({ fromPlane: 0, toPlane: 1, anchor: { x: OUTER_HIGH, z: CENTER } }),
	Object.freeze({ fromPlane: 0, toPlane: 1, anchor: { x: CENTER, z: OUTER_HIGH } }),
	Object.freeze({ fromPlane: 0, toPlane: 1, anchor: { x: OUTER_LOW, z: CENTER } }),
	Object.freeze({ fromPlane: 1, toPlane: 2, anchor: { x: INNER_LOW, z: INNER_LOW } }),
	Object.freeze({ fromPlane: 1, toPlane: 2, anchor: { x: INNER_HIGH, z: INNER_LOW } }),
	Object.freeze({ fromPlane: 1, toPlane: 2, anchor: { x: INNER_HIGH, z: INNER_HIGH } }),
	Object.freeze({ fromPlane: 1, toPlane: 2, anchor: { x: INNER_LOW, z: INNER_HIGH } })
]);

/**
 * Compiles the eight undirected semantic Yesod links into integer coordinates for one world.
 * @param {object} [world=DEFAULT_WORLD_PROFILE] Compiled active world profile.
 * @returns {Readonly<object>[]} Immutable gate-link records preserving the historical public object shape.
 */
export function gateLinksFor(world = DEFAULT_WORLD_PROFILE) {
	return Object.freeze(YESOD_LINK_KELIM.map((keli) => {
		const malchusPoint = worldAnchorPoint(keli.anchor, world.gridSize);
		return Object.freeze({
			fromPlane: keli.fromPlane,
			toPlane: keli.toPlane,
			x: malchusPoint.x,
			z: malchusPoint.z
		});
	}));
}

/**
 * Expands each undirected Yesod link into the sixteen directional records consumed by GateSystem.
 * @param {object} [world=DEFAULT_WORLD_PROFILE] Compiled active world profile.
 * @returns {Readonly<object>[]} Immutable directional gates with `{plane,x,z,targetPlane}` shape.
 */
export function gatesFor(world = DEFAULT_WORLD_PROFILE) {
	return Object.freeze(gateLinksFor(world).flatMap((link) => [
		Object.freeze({ plane: link.fromPlane, x: link.x, z: link.z, targetPlane: link.toPlane }),
		Object.freeze({ plane: link.toPlane, x: link.x, z: link.z, targetPlane: link.fromPlane })
	]));
}

export const GATE_LINKS = gateLinksFor();
export const GATES = gatesFor();
