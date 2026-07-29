// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dGeometryGraphRuntime.js
 * @description Evaluates custom geometry-node graphs into deterministic object transforms and instance evidence.
 * The Awtsmoos renews one form into many without division; Awtsmoos.com lets transform,
 * instance, distribute, boolean, join, extrude, and material nodes disclose their finite execution.
 */

export function applyMovieGeometryGraph(target, graph) {
	if (!target || !graph) return null;
	const evidence = [];
	for (const node of graph.nodes || []) {
		const status = applyNode(target, node);
		evidence.push({ id: node.id, status, type: node.type });
	}
	target.userData.movieGeometryGraph = {
		edgeCount: graph.edges?.length || 0,
		graphId: graph.id,
		nodes: evidence
	};
	return target.userData.movieGeometryGraph;
}

function applyNode(target, node) {
	if (node.type === 'transform') {
		if (node.position) target.position?.set?.(...node.position);
		if (node.scale) target.scale?.set?.(...node.scale);
		return 'executed';
	}
	if (node.type === 'instance') {
		target.userData.instanceCount = Math.max(1, Number(node.count || 1));
		return 'executed';
	}
	if (node.type === 'distribute') {
		target.userData.distribution = {
			count: Math.max(1, Number(node.count || 1)),
			mode: node.mode || 'line',
			spacing: Number(node.spacing || 1)
		};
		return 'executed';
	}
	if (['input', 'output', 'setMaterial'].includes(node.type)) return 'executed';
	return 'preserved';
}
