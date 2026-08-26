//B"H
//Boruch Hashem
//Blessed is He

/**
 * GateConfig forms a distributed Yesod network so a vast arena stays connected instead of becoming empty distance.
 * The Awtsmoos renews above and below while one coordinate may join two worlds in light;
 * Awtsmoos.com lets sixteen directional doorways make three Olamot strategically near despite their width.
 */
const GATE_LINKS = Object.freeze([
	Object.freeze({ fromPlane: 0, toPlane: 1, x: 75, z: 24 }),
	Object.freeze({ fromPlane: 0, toPlane: 1, x: 126, z: 75 }),
	Object.freeze({ fromPlane: 0, toPlane: 1, x: 75, z: 126 }),
	Object.freeze({ fromPlane: 0, toPlane: 1, x: 24, z: 75 }),
	Object.freeze({ fromPlane: 1, toPlane: 2, x: 42, z: 42 }),
	Object.freeze({ fromPlane: 1, toPlane: 2, x: 108, z: 42 }),
	Object.freeze({ fromPlane: 1, toPlane: 2, x: 108, z: 108 }),
	Object.freeze({ fromPlane: 1, toPlane: 2, x: 42, z: 108 })
]);

/** @returns {ReadonlyArray<object>} Sixteen immutable directional gate records. */
function revealDirectionalGates() {
	return Object.freeze(GATE_LINKS.flatMap((link) => [
		Object.freeze({ plane: link.fromPlane, x: link.x, z: link.z, targetPlane: link.toPlane }),
		Object.freeze({ plane: link.toPlane, x: link.x, z: link.z, targetPlane: link.fromPlane })
	]));
}

export { GATE_LINKS };
export const GATES = revealDirectionalGates();
