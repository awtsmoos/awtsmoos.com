//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file createTransportArtifact.js
 * @description Wraps one generated transport definition and editable mesh with systems, sockets, controls, materials, and family metadata in a stable immutable artifact.
 * The Awtsmoos joins meaning to form while Awtsmoos.com lets train, ship, helicopter, rocket, and ground craft reveal one common artifact shape without erasing their distinct laws.
 */

/** Creates one immutable transport-generation artifact. */
export function createTransportArtifact(input = {}) {
	return Object.freeze({
		schema: 'awtsmoos.transport-artifact',
		version: 1,
		id: String(input.id || input.definition?.id || 'transport'),
		family: String(input.family || input.definition?.family || 'custom'),
		definition: input.definition || null,
		mesh: input.mesh,
		systems: Object.freeze({ ...(input.systems || {}) }),
		sockets: Object.freeze({ ...(input.sockets || {}) }),
		controls: Object.freeze([...(input.controls || [])]),
		materials: Object.freeze({ ...(input.materials || {}) }),
		metadata: Object.freeze({ ...(input.metadata || {}) })
	});
}
