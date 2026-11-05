// B"H
// Boruch Hashem
// Blessed is He

/** Shared low-draw geometry helpers for organic hero-valley clusters. */
export function emptyClusterGeometry() {
	return { indices: [], uvs: [], vertices: [] };
}

export function appendEllipsoid(mesh, center, radius, rings = 4, segments = 9) {
	const start = mesh.vertices.length;
	for (let ring = 0; ring <= rings; ring += 1) {
		const vertical = ring / rings;
		const phi = vertical * Math.PI - Math.PI / 2;
		for (let segment = 0; segment < segments; segment += 1) {
			const horizontal = segment / segments;
			const angle = horizontal * Math.PI * 2;
			mesh.vertices.push([
				center.x + Math.cos(phi) * Math.cos(angle) * radius.x,
				center.y + Math.sin(phi) * radius.y,
				center.z + Math.cos(phi) * Math.sin(angle) * radius.z
			]);
			mesh.uvs.push(horizontal, vertical);
		}
	}
	for (let ring = 0; ring < rings; ring += 1) {
		for (let segment = 0; segment < segments; segment += 1) {
			const next = (segment + 1) % segments;
			const a = start + ring * segments + segment;
			const b = start + ring * segments + next;
			const c = a + segments;
			const d = b + segments;
			mesh.indices.push(a, b, c, b, d, c);
		}
	}
}

export function appendTaperedSegment(mesh, start, end, startRadius, endRadius, segments = 8) {
	const axis = normalized(vector(start, end));
	const reference = Math.abs(axis.y) > 0.86 ? { x: 1, y: 0, z: 0 } : { x: 0, y: 1, z: 0 };
	const right = normalized(cross(axis, reference));
	const up = normalized(cross(right, axis));
	const first = mesh.vertices.length;
	for (const [point, radius, vertical] of [[start, startRadius, 0], [end, endRadius, 1]]) {
		for (let segment = 0; segment < segments; segment += 1) {
			const angle = segment / segments * Math.PI * 2;
			const cosine = Math.cos(angle) * radius;
			const sine = Math.sin(angle) * radius;
			mesh.vertices.push([
				point.x + right.x * cosine + up.x * sine,
				point.y + right.y * cosine + up.y * sine,
				point.z + right.z * cosine + up.z * sine
			]);
			mesh.uvs.push(segment / segments, vertical);
		}
	}
	for (let segment = 0; segment < segments; segment += 1) {
		const next = (segment + 1) % segments;
		mesh.indices.push(first + segment, first + next, first + segments + segment);
		mesh.indices.push(first + next, first + segments + next, first + segments + segment);
	}
}

function vector(start, end) {
	return { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
}

function normalized(value) {
	const length = Math.hypot(value.x, value.y, value.z) || 1;
	return { x: value.x / length, y: value.y / length, z: value.z / length };
}

function cross(first, second) {
	return {
		x: first.y * second.z - first.z * second.y,
		y: first.z * second.x - first.x * second.z,
		z: first.x * second.y - first.y * second.x
	};
}
