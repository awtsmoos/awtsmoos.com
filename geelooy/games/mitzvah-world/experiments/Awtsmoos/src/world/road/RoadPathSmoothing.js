// B"H
import { segmentBlocked } from './StaticObstacleField.js';

/** Removes grid corners only when the complete replacement segment is clear. */
export function smoothRoadPath(points, field) {
	if (points.length <= 2) {
		return deduplicate(points);
	}
	const output = [points[0]];
	let anchor = 0;
	while (anchor < points.length - 1) {
		let candidate = points.length - 1;
		while (candidate > anchor + 1 && segmentBlocked(field, points[anchor], points[candidate])) {
			candidate -= 1;
		}
		output.push(points[candidate]);
		anchor = candidate;
	}
	return deduplicate(output);
}

export function deduplicate(points) {
	return points.filter((point, index) => index === 0 || Math.hypot(
		point.x - points[index - 1].x,
		point.z - points[index - 1].z
	) > 0.01);
}
