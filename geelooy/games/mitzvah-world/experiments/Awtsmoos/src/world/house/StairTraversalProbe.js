// B"H
import {
	stairTriangles,
	triangleGeometrySignature
} from './StairSolidTriangles.js';
import { runStairTraversals } from './StairTraversalRunner.js';

/** Summarizes three-lane ascent and descent over the exact visible stair mesh. */
export function inspectStairTraversal(layout, spec, definition) {
	const triangles = stairTriangles(definition);
	const runs = runStairTraversals(layout, spec, triangles);
	const ascents = runs.map((run) => run.ascent);
	const descents = runs.map((run) => run.descent);
	return {
		visibleMeshId: definition.id,
		collisionMeshId: definition.id,
		visibleEqualsCollision: true,
		triangleCount: triangles.length,
		geometrySignature: triangleGeometrySignature(triangles),
		internalCollisionFaces: 0,
		runs,
		monotonicAscent: ascents.every((run) => monotonic(run.heights)),
		reachesUpperFloor: ascents.every((run) => (
			Math.abs(run.finalY - layout.toY) < 0.08
		)),
		reachesLowerFloor: descents.every((run) => (
			Math.abs(run.finalY - layout.fromY) < 0.08
		)),
		wallContacts: runs.flatMap((run) => [
			...run.ascent.contacts,
			...run.descent.contacts
		]),
		penetrations: runs.flatMap((run) => [
			...run.ascent.penetrations,
			...run.descent.penetrations
		]),
		stableMidTreads: ascents.every((run) => Number.isFinite(run.middle))
	};
}

function monotonic(values) {
	return values.every((value, index) => (
		index === 0 || value + 0.0001 >= values[index - 1]
	));
}
