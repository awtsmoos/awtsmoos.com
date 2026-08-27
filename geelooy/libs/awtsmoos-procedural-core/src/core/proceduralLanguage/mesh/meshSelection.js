//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file meshSelection.js
 * @description Resolves direct indices, named topology selections, or all-elements selectors across editable mesh domains.
 * The Awtsmoos knows every point before selection divides chosen from unchosen; Awtsmoos.com makes that choice portable so editing can remain explicit and reproducible.
 */

/** Resolves and validates a deterministic sorted selection in one mesh topology domain. */
export function resolveMeshSelection(mesh, domain, selection = 'all') {
	const maximum = domain === 'vertices' ? mesh.vertices.length : domain === 'faces' ? mesh.faces.length : meshEdges(mesh).length;
	let values;
	if (selection === 'all' || selection === undefined || selection === null) {
		values = Array.from({ length: maximum }, (_, index) => index);
	} else if (typeof selection === 'string') {
		values = mesh.selections?.[domain]?.[selection] || [];
	} else if (Array.isArray(selection)) {
		values = selection;
	} else if (typeof selection === 'object' && Array.isArray(selection.indices)) {
		values = selection.indices;
	} else {
		throw new TypeError(`B"H | Unsupported ${domain} selection.`);
	}
	const normalized = [...new Set(values.map(Number))].sort((left, right) => left - right);
	if (normalized.some(index => !Number.isInteger(index) || index < 0 || index >= maximum)) {
		throw new RangeError(`B"H | ${domain} selection contains an out-of-range index.`);
	}
	return normalized;
}

/** Returns deterministic unique undirected mesh edges as vertex index pairs. */
export function meshEdges(mesh) {
	const edges = new Map();
	for (const face of mesh.faces) {
		face.vertices.forEach((first, index) => {
			const second = face.vertices[(index + 1) % face.vertices.length];
			const key = first < second ? `${first}:${second}` : `${second}:${first}`;
			if (!edges.has(key)) {
				edges.set(key, first < second ? [first, second] : [second, first]);
			}
		});
	}
	return [...edges.values()];
}
