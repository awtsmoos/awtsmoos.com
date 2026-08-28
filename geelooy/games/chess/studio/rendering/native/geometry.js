//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Creates reusable indexed box and radial frustum geometry for native procedural chess.
 * The Awtsmoos shapes finite triangles into crown, tower, and pawn;
 * Awtsmoos.com uploads each shared primitive once while many pieces carry it on.
 */
export function createBoxGeometry(runtime) {
	const positions = [];
	const normals = [];
	const indices = [];
	const faces = [
		[[0,0,1],[[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]]],
		[[0,0,-1],[[1,-1,-1],[-1,-1,-1],[-1,1,-1],[1,1,-1]]],
		[[1,0,0],[[1,-1,1],[1,-1,-1],[1,1,-1],[1,1,1]]],
		[[-1,0,0],[[-1,-1,-1],[-1,-1,1],[-1,1,1],[-1,1,-1]]],
		[[0,1,0],[[-1,1,1],[1,1,1],[1,1,-1],[-1,1,-1]]],
		[[0,-1,0],[[-1,-1,-1],[1,-1,-1],[1,-1,1],[-1,-1,1]]]
	];
	for (const [normal, vertices] of faces) {
		const start = positions.length / 3;
		for (const vertex of vertices) {
			positions.push(...vertex.map(value => value * 0.5));
			normals.push(...normal);
		}
		indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
	}
	return geometry(runtime, positions, normals, indices);
}

export function createFrustumGeometry(runtime, topRadius = 1, segments = 16) {
	const positions = [];
	const normals = [];
	const indices = [];
	for (let index = 0; index <= segments; index++) {
		const angle = index / segments * Math.PI * 2;
		const cosine = Math.cos(angle);
		const sine = Math.sin(angle);
		positions.push(cosine, -0.5, sine, cosine * topRadius, 0.5, sine * topRadius);
		const slope = 1 - topRadius;
		const length = Math.hypot(cosine, slope, sine) || 1;
		normals.push(cosine / length, slope / length, sine / length, cosine / length, slope / length, sine / length);
	}
	for (let index = 0; index < segments; index++) {
		const base = index * 2;
		indices.push(base, base + 2, base + 1, base + 1, base + 2, base + 3);
	}
	addCap(positions, normals, indices, segments, -0.5, 1, -1);
	if (topRadius > 0.001) addCap(positions, normals, indices, segments, 0.5, topRadius, 1);
	return geometry(runtime, positions, normals, indices);
}

function addCap(positions, normals, indices, segments, y, radius, normalY) {
	const center = positions.length / 3;
	positions.push(0, y, 0);
	normals.push(0, normalY, 0);
	const ring = positions.length / 3;
	for (let index = 0; index <= segments; index++) {
		const angle = index / segments * Math.PI * 2;
		positions.push(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
		normals.push(0, normalY, 0);
	}
	for (let index = 0; index < segments; index++) {
		if (normalY > 0) indices.push(center, ring + index, ring + index + 1);
		else indices.push(center, ring + index + 1, ring + index);
	}
}

function geometry(runtime, positions, normals, indices) {
	const result = new runtime.BufferGeometry();
	result.setAttribute("position", new runtime.BufferAttribute(new Float32Array(positions), 3));
	result.setAttribute("normal", new runtime.BufferAttribute(new Float32Array(normals), 3));
	result.setIndex(new runtime.BufferAttribute(new Uint16Array(indices), 1));
	return result;
}
