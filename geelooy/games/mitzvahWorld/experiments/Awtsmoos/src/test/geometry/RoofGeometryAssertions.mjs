// B"H
import assert from 'node:assert/strict';

/** Proves each roof is a closed coordinate manifold with downward underside faces. */
export function assertRoofGeometry(roofs, expectedCount) {
	assert.equal(roofs.length, expectedCount);
	for (const roof of roofs) {
		const evidence = roof.userData.AwtsmoosRoof;
		assert.equal(roof.solid, true);
		assert.equal(evidence.closed, true);
		assert.equal(evidence.undersideVisible, true);
		assert.equal(evidence.outerTriangles, 4);
		assert.equal(evidence.undersideTriangles, 4);
		assertManifoldEdges(roof);
		assertUndersideNormals(roof);
	}
}

function assertManifoldEdges(roof) {
	const counts = new Map();
	for (const face of roof.faces) {
		for (let index = 0; index < face.length; index += 1) {
			const left = roof.vertices[face[index]];
			const right = roof.vertices[face[(index + 1) % face.length]];
			const key = edgeKey(left, right);
			counts.set(key, (counts.get(key) || 0) + 1);
		}
	}
	const invalid = [...counts.entries()].filter(([, count]) => count !== 2);
	assert.equal(invalid.length, 0, `${roof.id} has open or duplicated solid edges`);
}

function assertUndersideNormals(roof) {
	for (const faceIndex of [1, 4, 7, 10]) {
		const face = roof.faces[faceIndex];
		const normal = triangleNormal(
			roof.vertices[face[0]],
			roof.vertices[face[1]],
			roof.vertices[face[2]]
		);
		assert.ok(normal.y < -0.01, `${roof.id} underside does not face downward`);
	}
}

function edgeKey(left, right) {
	const first = pointKey(left);
	const second = pointKey(right);
	return first < second ? `${first}|${second}` : `${second}|${first}`;
}

function pointKey(point) {
	return point.map((value) => value.toFixed(5)).join(',');
}

function triangleNormal(a, b, c) {
	const ab = { x: b[0] - a[0], y: b[1] - a[1], z: b[2] - a[2] };
	const ac = { x: c[0] - a[0], y: c[1] - a[1], z: c[2] - a[2] };
	return {
		x: ab.y * ac.z - ab.z * ac.y,
		y: ab.z * ac.x - ab.x * ac.z,
		z: ab.x * ac.y - ab.y * ac.x
	};
}
