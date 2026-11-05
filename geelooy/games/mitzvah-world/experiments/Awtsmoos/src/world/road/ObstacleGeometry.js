// B"H
export function pointInsideObstacle(point, obstacle) {
	if (obstacle.type === 'capsule') {
		return pointSegmentDistance(point, obstacle.start, obstacle.end) < obstacle.radius;
	}
	return pointInsidePolygon(point, obstacle.points);
}

export function segmentHitsObstacle(start, end, obstacle) {
	if (obstacle.type === 'capsule') {
		return segmentDistance(start, end, obstacle.start, obstacle.end) < obstacle.radius;
	}
	if (pointInsidePolygon(start, obstacle.points) || pointInsidePolygon(end, obstacle.points)) {
		return true;
	}
	return polygonEdges(obstacle.points).some(([left, right]) => segmentsIntersect(start, end, left, right));
}

export function polygonHitsObstacle(polygon, obstacle) {
	if (polygon.some((point) => pointInsideObstacle(point, obstacle))) {
		return true;
	}
	if (obstacle.type === 'capsule') {
		if (pointInsidePolygon(obstacle.start, polygon) || pointInsidePolygon(obstacle.end, polygon)) {
			return true;
		}
		return polygonEdges(polygon).some(([start, end]) => segmentHitsObstacle(start, end, obstacle));
	}
	if (obstacle.points.some((point) => pointInsidePolygon(point, polygon))) {
		return true;
	}
	return polygonEdges(polygon).some(([start, end]) => segmentHitsObstacle(start, end, obstacle));
}

export function obstacleBounds(obstacle) {
	if (obstacle.type === 'capsule') {
		return {
			minX: Math.min(obstacle.start.x, obstacle.end.x) - obstacle.radius,
			maxX: Math.max(obstacle.start.x, obstacle.end.x) + obstacle.radius,
			minZ: Math.min(obstacle.start.z, obstacle.end.z) - obstacle.radius,
			maxZ: Math.max(obstacle.start.z, obstacle.end.z) + obstacle.radius
		};
	}
	return {
		minX: Math.min(...obstacle.points.map((point) => point.x)),
		maxX: Math.max(...obstacle.points.map((point) => point.x)),
		minZ: Math.min(...obstacle.points.map((point) => point.z)),
		maxZ: Math.max(...obstacle.points.map((point) => point.z))
	};
}

function pointInsidePolygon(point, polygon) {
	let inside = false;
	for (let current = 0, previous = polygon.length - 1; current < polygon.length; previous = current++) {
		const a = polygon[current];
		const b = polygon[previous];
		const crosses = (a.z > point.z) !== (b.z > point.z)
			&& point.x < (b.x - a.x) * (point.z - a.z) / ((b.z - a.z) || 1e-9) + a.x;
		if (crosses) inside = !inside;
	}
	return inside;
}

function polygonEdges(polygon) {
	return polygon.map((point, index) => [point, polygon[(index + 1) % polygon.length]]);
}

function pointSegmentDistance(point, start, end) {
	const dx = end.x - start.x;
	const dz = end.z - start.z;
	const denominator = dx * dx + dz * dz || 1;
	const ratio = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.z - start.z) * dz) / denominator));
	return Math.hypot(point.x - start.x - dx * ratio, point.z - start.z - dz * ratio);
}

function segmentDistance(a, b, c, d) {
	if (segmentsIntersect(a, b, c, d)) {
		return 0;
	}
	return Math.min(
		pointSegmentDistance(a, c, d),
		pointSegmentDistance(b, c, d),
		pointSegmentDistance(c, a, b),
		pointSegmentDistance(d, a, b)
	);
}

function segmentsIntersect(a, b, c, d) {
	const abC = cross(a, b, c);
	const abD = cross(a, b, d);
	const cdA = cross(c, d, a);
	const cdB = cross(c, d, b);
	if (opposite(abC, abD) && opposite(cdA, cdB)) {
		return true;
	}
	return (nearZero(abC) && onSegment(a, b, c))
		|| (nearZero(abD) && onSegment(a, b, d))
		|| (nearZero(cdA) && onSegment(c, d, a))
		|| (nearZero(cdB) && onSegment(c, d, b));
}

function cross(a, b, c) {
	return (b.x - a.x) * (c.z - a.z) - (b.z - a.z) * (c.x - a.x);
}

function opposite(left, right) {
	return left > 1e-9 && right < -1e-9 || left < -1e-9 && right > 1e-9;
}

function nearZero(value) {
	return Math.abs(value) <= 1e-9;
}

function onSegment(start, end, point) {
	return point.x >= Math.min(start.x, end.x) - 1e-9
		&& point.x <= Math.max(start.x, end.x) + 1e-9
		&& point.z >= Math.min(start.z, end.z) - 1e-9
		&& point.z <= Math.max(start.z, end.z) + 1e-9;
}
