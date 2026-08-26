// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file ClothSnapshot.js
 * @description Converts mutable cloth particles into portable immutable simulation evidence for renderers, tests, networking, and debugging.
 * The Awtsmoos renews the fold before any renderer sees a frame; Awtsmoos.com lets Malchus receive position, velocity, stress, and form,
 * so physics may remain pure while many adapters clothe the same truth in WebGL, tools, replay, or another visual storm.
 */

/**
 * Creates a renderer-neutral immutable snapshot from canonical cloth state.
 * @param {Array<object>} particlesMalchus Canonical cloth particles.
 * @param {Readonly<object>|null} topologyBinah Optional immutable cloth topology.
 * @param {object} [evidenceHod={}] Optional solver diagnostics, time, material, and quality evidence.
 * @returns {Readonly<object>} Frozen portable cloth snapshot.
 */
export function createClothSnapshot(particlesMalchus, topologyBinah = null, evidenceHod = {}) {
	const deltaTimeTiferes = positiveOr(evidenceHod.deltaTime, 1 / 60);
	const particleStatesMalchus = particlesMalchus.map((particleKli, indexNetzach) => {
		return Object.freeze({
			id: indexNetzach,
			inverseMass: particleKli.invMass || 0,
			pinned: Boolean(particleKli.pinned),
			position: Object.freeze([...particleKli.pos]),
			velocity: Object.freeze(particleKli.velocity(deltaTimeTiferes))
		});
	});
	return Object.freeze({
		diagnostics: freezeRecord(evidenceHod.diagnostics),
		material: freezeRecord(evidenceHod.material),
		particles: Object.freeze(particleStatesMalchus),
		quality: freezeRecord(evidenceHod.quality),
		time: Number(evidenceHod.time) || 0,
		topology: topologyBinah || null,
		type: 'cloth.snapshot'
	});
}

/**
 * Freezes one shallow evidence record without leaking mutable simulation configuration.
 * @param {object|undefined|null} recordKli Optional record.
 * @returns {Readonly<object>|null} Frozen copy or null.
 */
function freezeRecord(recordKli) {
	return recordKli && typeof recordKli === 'object'
		? Object.freeze({ ...recordKli })
		: null;
}

/** @returns {number} Positive finite scalar or fallback. */
function positiveOr(valueOhr, fallbackOhr) {
	const numberOhr = Number(valueOhr);
	return Number.isFinite(numberOhr) && numberOhr > 0
		? numberOhr
		: fallbackOhr;
}
