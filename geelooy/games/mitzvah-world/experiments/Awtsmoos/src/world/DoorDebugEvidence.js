// B"H
import {
	matrixBasis,
	matrixMaximumDelta,
	vectorAngle
} from './DoorWorldMatrix.js';

/** Reads the rendered matrix after parent composition and compares it to collision. */
export function createDoorDebugEvidence(door) {
	const actualMatrix = Array.from(door.refreshWorldMatrix());
	const expectedMatrix = door.pose.matrix;
	const actualBasis = matrixBasis(actualMatrix);
	const wall = door.def.frame.basis;
	return {
		id: door.def.id,
		state: door.state,
		progress: door.t,
		currentAngle: door.pose.angle,
		worldMatrix: actualMatrix,
		colliderWorldMatrix: expectedMatrix,
		matrixDelta: matrixMaximumDelta(actualMatrix, expectedMatrix),
		panelTangentAngleToWall: vectorAngle(actualBasis.tangent, wall.right),
		panelNormalAngleToWall: vectorAngle(actualBasis.normal, wall.outward),
		frame: door.def.frame,
		obb: door.obb(),
		interaction: door.interaction.debug()
	};
}
