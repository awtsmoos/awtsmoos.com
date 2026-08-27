// B"H
// Boruch Hashem
// Blessed is He
/** Face segments join into deterministic cube-local contour loops. */

function segmentKey(left, right) {
	return left < right ? `${left}:${right}` : `${right}:${left}`;
}

export function traceCubeLoops(segments) {
	const adjacency = new Map();
	for (const [left, right] of segments) {
		if (!adjacency.has(left)) adjacency.set(left, []);
		if (!adjacency.has(right)) adjacency.set(right, []);
		adjacency.get(left).push(right);
		adjacency.get(right).push(left);
	}
	for (const neighbors of adjacency.values()) neighbors.sort((a, b) => a - b);
	const visited = new Set();
	const loops = [];
	const starts = [...adjacency.keys()].sort((a, b) => a - b);
	for (const start of starts) {
		for (const first of adjacency.get(start)) {
			if (visited.has(segmentKey(start, first))) continue;
			const loop = [start];
			let previous = start;
			let current = first;
			visited.add(segmentKey(start, first));
			while (current !== start && loop.length <= 12) {
				loop.push(current);
				const next = (adjacency.get(current) ?? [])
					.find(candidate => candidate !== previous && !visited.has(segmentKey(current, candidate)));
				if (next == null) break;
				visited.add(segmentKey(current, next));
				previous = current;
				current = next;
			}
			if (current === start && loop.length >= 3) loops.push(Object.freeze(loop));
		}
	}
	return Object.freeze(loops);
}
