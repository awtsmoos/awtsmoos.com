// B"H
/** Small geometry writer that keeps top-face evidence beside every road vertex. */
export function createRoadMesh(tileWorld) {
	return {
		tileWorld,
		vertices: [],
		faces: [],
		uvs: [],
		topFaceIndices: []
	};
}

export function addRoadVertex(mesh, point) {
	mesh.vertices.push([point.x, point.y, point.z]);
	mesh.uvs.push(
		point.x / mesh.tileWorld,
		point.z / mesh.tileWorld
	);
	return mesh.vertices.length - 1;
}

export function addRoadFace(mesh, indices, top = false) {
	if (top) {
		mesh.topFaceIndices.push(mesh.faces.length);
	}
	mesh.faces.push(indices);
	return mesh.faces.length - 1;
}
