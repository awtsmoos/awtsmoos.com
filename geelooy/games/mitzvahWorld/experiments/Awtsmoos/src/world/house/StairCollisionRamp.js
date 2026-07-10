// B"H
import { trianglesFromIndexed } from '../../collision/TriangleCollider.js';
import { transformPoint, v } from '../../math/Geometry3D.js';

/**
 * Creates only the walkable upper skin of the ramp. Two triangles replace the
 * forest of hidden risers that once swallowed the player capsule.
 */
export function createStairCollisionRamp(layout, spec) {
	const first = layout.steps[0];
	const last = layout.steps[layout.steps.length - 1];
	const lowZ = first.centerZ + first.depth / 2;
	const highZ = last.centerZ - last.depth / 2;
	const x0 = layout.lowerLanding.centerX - layout.width / 2;
	const x1 = layout.lowerLanding.centerX + layout.width / 2;
	const run = Math.abs(lowZ - highZ);
	const slopeAngle = Math.atan2(layout.totalRise, run);
	const slopeNormalY = Math.cos(slopeAngle);
	return {
		id: `${layout.id}-collision-ramp`,
		shape: 'manual',
		solid: true,
		walkable: true,
		visible: false,
		noEdge: true,
		position: { x: spec.x, y: 0, z: spec.z },
		rotation: { y: spec.yaw },
		vertices: [
			[x0, layout.fromY, lowZ],
			[x1, layout.fromY, lowZ],
			[x1, layout.toY, highZ],
			[x0, layout.toY, highZ]
		],
		faces: [[0, 1, 2, 3]],
		userData: {
			AwtsmoosStairLayout: layout,
			AwtsmoosStairCollision: {
				houseId: layout.houseId,
				level: layout.fromLevel,
				visualMeshId: `${layout.id}-visual`,
				collisionRampId: `${layout.id}-collision-ramp`,
				rampTriangleCount: 2,
				internalCollisionFaces: 0,
				slopeAngle,
				slopeNormalY,
				walkable: slopeNormalY > 0.72,
				lowerTransitionClear: true,
				upperTransitionClear: true,
				lowZ,
				highZ,
				width: layout.width
			}
		}
	};
}

/** Converts the authored ramp exactly as the runtime procedural bridge does. */
export function collisionTrianglesForRamp(definition) {
	const center = definition.position || { x: 0, y: 0, z: 0 };
	const yaw = definition.rotation?.y || 0;
	const vertices = definition.vertices.map(([x, y, z]) => transformPoint(v(x, y, z), center, yaw));
	return trianglesFromIndexed(vertices, [0, 1, 2, 0, 2, 3], {
		kind: definition.id,
		solid: true
	});
}
