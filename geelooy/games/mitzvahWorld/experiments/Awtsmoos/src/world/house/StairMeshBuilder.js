// B"H
/** Builds one merged static mesh for an entire stair run and lower landing. */
export function createStairDefinition(layout, spec, material) {
	const mesh = { vertices: [], faces: [] };
	appendLanding(mesh, layout.lowerLanding, spec.floorThickness);
	for (const step of layout.steps) {
		appendStep(mesh, step, spec.floorThickness);
	}
	return {
		id: layout.id,
		shape: 'manual',
		solid: true,
		walkable: true,
		noEdge: true,
		...material,
		position: { x: spec.x, y: 0, z: spec.z },
		vertices: mesh.vertices,
		faces: mesh.faces,
		rotation: { y: spec.yaw },
		userData: {
			AwtsmoosStairLayout: layout,
			colliderUnits: layout.stepCount + 1
		}
	};
}

function appendLanding(mesh, landing, thickness) {
	appendCuboid(mesh, {
		x: landing.centerX,
		y: landing.topY - thickness / 2,
		z: landing.centerZ,
		width: landing.width,
		height: thickness,
		depth: landing.depth
	});
}

function appendStep(mesh, step, minimumThickness) {
	const height = Math.max(minimumThickness, step.topY - step.bottomY);
	appendCuboid(mesh, {
		x: step.centerX,
		y: step.bottomY + height / 2,
		z: step.centerZ,
		width: step.width,
		height,
		depth: step.depth
	});
}

function appendCuboid(mesh, box) {
	const start = mesh.vertices.length;
	const hx = box.width / 2;
	const hy = box.height / 2;
	const hz = box.depth / 2;
	mesh.vertices.push(
		[box.x - hx, box.y - hy, box.z + hz],
		[box.x + hx, box.y - hy, box.z + hz],
		[box.x + hx, box.y + hy, box.z + hz],
		[box.x - hx, box.y + hy, box.z + hz],
		[box.x - hx, box.y - hy, box.z - hz],
		[box.x + hx, box.y - hy, box.z - hz],
		[box.x + hx, box.y + hy, box.z - hz],
		[box.x - hx, box.y + hy, box.z - hz]
	);
	mesh.faces.push(
		[start, start + 1, start + 2, start + 3],
		[start + 5, start + 4, start + 7, start + 6],
		[start + 4, start, start + 3, start + 7],
		[start + 1, start + 5, start + 6, start + 2],
		[start + 3, start + 2, start + 6, start + 7],
		[start + 4, start + 5, start + 1, start]
	);
}
