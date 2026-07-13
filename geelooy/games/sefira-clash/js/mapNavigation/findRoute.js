//B"H
//Boruch Hashem
//Blessed is He

/**
 * The Awtsmoos renews the find route vessel in this instant, revealing
 * its focused js map navigation service within Awtsmoos.com while every
 * import, rule, and value receives existence anew without confused purpose.
 */
/**
 * B"H
 * Graph route finder.
 *
 * Chapter 205: the route is short, practical, and cheap. BFS is enough for
 * platform arenas and safer than wandering impulses.
 */
export function findRoute(graph, start, goal) {
	if (start === goal) return [start];
	const queue = [start];
	const prev = new Map([[start, -1]]);
	for (let i = 0; i < queue.length; i++) {
		const node = queue[i];
		for (const edge of graph.edges[node] || []) {
			if (prev.has(edge.to)) continue;
			prev.set(edge.to, node);
			if (edge.to === goal) return unwind(prev, goal);
			queue.push(edge.to);
		}
	}
	return [start, goal];
}

function unwind(prev, goal) {
	const path = [goal];
	let at = goal;
	while (prev.get(at) !== -1) {
		at = prev.get(at);
		path.push(at);
	}
	return path.reverse();
}
