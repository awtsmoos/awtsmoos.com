// B"H
/** Plans each graph edge with a safe curve and an unsmoothed house tail. */
export function planRoadRoutes(graph) {
	const nodes = new Map(graph.nodes.map((node) => [node.id, node]));
	return graph.edges.map((edge) => {
		const from = nodes.get(edge.from);
		const to = nodes.get(edge.to);
		const points = to.kind === 'house-entry'
			? houseRoute(from, to)
			: linearRoute(from, to);
		return {
			...edge,
			points,
			foldedSegments: foldedTail(points, to)
		};
	});
}

function houseRoute(from, entry) {
	const start = { x: from.x, z: from.z };
	const gate = { x: entry.gate.x, z: entry.gate.z };
	const landing = { x: entry.landing.x, z: entry.landing.z };
	const direction = normalized(landing.x - gate.x, landing.z - gate.z);
	const distance = Math.hypot(gate.x - start.x, gate.z - start.z);
	const handle = Math.min(18, Math.max(6, distance * 0.26));
	const control = {
		x: gate.x - direction.x * handle,
		z: gate.z - direction.z * handle
	};
	const curved = sampleQuadratic(start, control, gate, Math.max(8, Math.ceil(distance / 4)));
	return deduplicate([...curved, gate, landing]);
}

function linearRoute(from, to) {
	return [
		{ x: from.x, z: from.z },
		{ x: to.x, z: to.z }
	];
}

function sampleQuadratic(start, control, end, segments) {
	const points = [];
	for (let index = 0; index < segments; index += 1) {
		const t = index / segments;
		const inverse = 1 - t;
		points.push({
			x: inverse * inverse * start.x + 2 * inverse * t * control.x + t * t * end.x,
			z: inverse * inverse * start.z + 2 * inverse * t * control.z + t * t * end.z
		});
	}
	return points;
}

function foldedTail(points, entry) {
	if (entry.kind !== 'house-entry' || points.length < 3) {
		return [];
	}
	const expected = normalized(entry.landing.x - entry.gate.x, entry.landing.z - entry.gate.z);
	const folded = [];
	for (let index = Math.max(1, points.length - 3); index < points.length; index += 1) {
		const segment = normalized(points[index].x - points[index - 1].x, points[index].z - points[index - 1].z);
		if (segment.x * expected.x + segment.z * expected.z <= 0) {
			folded.push(index - 1);
		}
	}
	return folded;
}

function normalized(x, z) {
	const length = Math.hypot(x, z) || 1;
	return { x: x / length, z: z / length };
}

function deduplicate(points) {
	return points.filter((point, index) => index === 0 || Math.hypot(
		point.x - points[index - 1].x,
		point.z - points[index - 1].z
	) > 0.01);
}
