//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file treeFlowerPrimitive.js
 * @description Builds one reusable low-poly radial blossom with distinct petals and a raised floral center.
 * The mesh is plain indexed geometry, allowing any renderer to instance thousands of flowers from one immutable botanical primitive.
 */

/** Pushes one petal as a tapered four-vertex surface around local positive Y. */
function addPetal(mesh, angle, radius, width, lift) {
	const radial = [Math.cos(angle), 0, Math.sin(angle)];
	const tangent = [-radial[2], 0, radial[0]];
	const start = mesh.positions.length / 3;
	const points = [
		[radial[0] * 0.08, 0, radial[2] * 0.08],
		[radial[0] * radius * 0.48 + tangent[0] * width, lift * 0.35, radial[2] * radius * 0.48 + tangent[2] * width],
		[radial[0] * radius, lift, radial[2] * radius],
		[radial[0] * radius * 0.48 - tangent[0] * width, lift * 0.35, radial[2] * radius * 0.48 - tangent[2] * width]
	];
	for (const point of points) {
		mesh.positions.push(...point);
		mesh.normals.push(0, 1, 0);
	}
	mesh.uvs.push(0.5, 0, 1, 0.45, 0.5, 1, 0, 0.45);
	mesh.indices.push(start, start + 1, start + 2, start, start + 2, start + 3);
}

/** Creates one immutable five-petal flower primitive with a small raised center. */
export function createTreeFlowerPrimitive() {
	const mesh = { positions: [], normals: [], uvs: [], indices: [] };
	for (let petal = 0; petal < 5; petal += 1) {
		addPetal(mesh, petal / 5 * Math.PI * 2, 1, 0.22, 0.18);
	}
	const centerStart = mesh.positions.length / 3;
	mesh.positions.push(
		0, 0.08, 0,
		0.18, 0.02, 0,
		0, 0.02, 0.18,
		-0.18, 0.02, 0,
		0, 0.02, -0.18
	);
	for (let index = 0; index < 5; index += 1) {
		mesh.normals.push(0, 1, 0);
		mesh.uvs.push(index === 0 ? 0.5 : index % 2, index === 0 ? 0.5 : Math.floor(index / 2) % 2);
	}
	mesh.indices.push(
		centerStart, centerStart + 1, centerStart + 2,
		centerStart, centerStart + 2, centerStart + 3,
		centerStart, centerStart + 3, centerStart + 4,
		centerStart, centerStart + 4, centerStart + 1
	);
	return Object.freeze({
		id: "tree.flower",
		materialRole: "tree.reproduction.flower",
		mesh: freezeMesh(mesh)
	});
}

/** Freezes every geometry buffer so shared flower topology cannot be mutated by consumers. */
function freezeMesh(mesh) {
	return Object.freeze({
		positions: Object.freeze(mesh.positions),
		normals: Object.freeze(mesh.normals),
		uvs: Object.freeze(mesh.uvs),
		indices: Object.freeze(mesh.indices)
	});
}
