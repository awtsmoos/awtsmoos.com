// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos renews every point and polygon from nothing at every instant.
 * This vessel belongs to Awtsmoos.com and reveals one bounded responsibility
 * so the greater procedural world can remain inspectable, safe, and alive.
 */

export function connectLoftRings(rings, indices) {
	for (let ringIndex = 0; ringIndex < rings.length - 1; ringIndex += 1) {
		const current = rings[ringIndex];
		const next = rings[ringIndex + 1];

		for (let radialIndex = 0; radialIndex < current.length; radialIndex += 1) {
			const following = (radialIndex + 1) % current.length;
			indices.push(
				current[radialIndex],
				next[radialIndex],
				next[following],
				current[radialIndex],
				next[following],
				current[following]
			);
		}
	}
}

export function capLoftRing(ring, positions, uvs, indices, reverse) {
	const centerIndex = positions.length / 3;
	const center = averageRing(ring, positions);
	positions.push(...center);
	uvs.push(0.5, 0.5);

	for (let index = 0; index < ring.length; index += 1) {
		const next = (index + 1) % ring.length;
		const triangle = reverse
			? [
				centerIndex,
				ring[next],
				ring[index]
			]
			: [
				centerIndex,
				ring[index],
				ring[next]
			];
		indices.push(...triangle);
	}
}

function averageRing(ring, positions) {
	const center = [
		0,
		0,
		0
	];
	for (const vertexIndex of ring) {
		center[0] += positions[vertexIndex * 3];
		center[1] += positions[vertexIndex * 3 + 1];
		center[2] += positions[vertexIndex * 3 + 2];
	}
	return center.map((value) => value / ring.length);
}
