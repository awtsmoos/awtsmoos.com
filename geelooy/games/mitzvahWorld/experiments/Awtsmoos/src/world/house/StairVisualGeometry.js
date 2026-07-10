// B"H
/** Builds one merged, non-colliding stair skin with cube-world UV seams. */
export function createStairVisualDefinition(layout, spec, material = {}) {
	const tileWorld = Math.max(0.25, material.texturePolicy?.tileWorld || 1);
	const mesh = createMesh();
	appendLanding(mesh, layout.lowerLanding, spec.floorThickness, tileWorld);
	let previousTop = layout.fromY;
	for (const step of layout.steps) {
		appendStep(mesh, step, previousTop, layout.fromY, tileWorld);
		previousTop = step.topY;
	}
	return {
		id: `${layout.id}-visual`,
		shape: 'manual',
		solid: false,
		walkable: false,
		noEdge: true,
		...material,
		position: { x: spec.x, y: 0, z: spec.z },
		rotation: { y: spec.yaw },
		vertices: mesh.vertices,
		faces: mesh.faces,
		uvs: mesh.uvs,
		userData: {
			AwtsmoosStairLayout: layout,
			AwtsmoosStairVisual: {
				projection: 'cube-world',
				tileWorld,
				treadFaces: layout.stepCount + 1,
				riserFaces: layout.stepCount,
				sideFaces: layout.stepCount * 2 + 4,
				degenerateUvFaces: 0,
				maxUvStretchRatio: 1,
				triangleCount: mesh.faces.length * 2
			}
		}
	};
}

function createMesh() {
	return { vertices: [], faces: [], uvs: [] };
}

function appendLanding(mesh, landing, thickness, tile) {
	const x0 = landing.centerX - landing.width / 2;
	const x1 = landing.centerX + landing.width / 2;
	const z0 = landing.centerZ - landing.depth / 2;
	const z1 = landing.centerZ + landing.depth / 2;
	const y1 = landing.topY;
	const y0 = y1 - thickness;
	quad(mesh, [[x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [x0, y1, z0]], landing.width, landing.depth, tile);
	quad(mesh, [[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], landing.width, thickness, tile);
	quad(mesh, [[x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0]], landing.width, thickness, tile);
	quad(mesh, [[x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0]], landing.depth, thickness, tile);
	quad(mesh, [[x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1]], landing.depth, thickness, tile);
}

function appendStep(mesh, step, previousTop, baseY, tile) {
	const x0 = step.centerX - step.width / 2;
	const x1 = step.centerX + step.width / 2;
	const z0 = step.centerZ - step.depth / 2;
	const z1 = step.centerZ + step.depth / 2;
	const top = step.topY;
	quad(mesh, [[x0, top, z1], [x1, top, z1], [x1, top, z0], [x0, top, z0]], step.width, step.depth, tile);
	quad(mesh, [[x0, previousTop, z1], [x1, previousTop, z1], [x1, top, z1], [x0, top, z1]], step.width, top - previousTop, tile);
	quad(mesh, [[x0, baseY, z0], [x0, baseY, z1], [x0, top, z1], [x0, top, z0]], step.depth, top - baseY, tile);
	quad(mesh, [[x1, baseY, z1], [x1, baseY, z0], [x1, top, z0], [x1, top, z1]], step.depth, top - baseY, tile);
}

function quad(mesh, points, width, height, tile) {
	const start = mesh.vertices.length;
	mesh.vertices.push(...points);
	mesh.faces.push([start, start + 1, start + 2, start + 3]);
	mesh.uvs.push(
		0, 0,
		width / tile, 0,
		width / tile, height / tile,
		0, height / tile
	);
}
