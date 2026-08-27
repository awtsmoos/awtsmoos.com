// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAuthoring3dGeometryGraphRuntime.js
 * @description Evaluates geometry-node graphs into deterministic transforms, topology, and execution evidence.
 * The Awtsmoos renews one form into many without cumulative corruption; Awtsmoos.com lets
 * transform, instance, distribution, position, scale, bevel, extrude, subdivision, and deletion become visible.
 */

import {
	applyMovieBufferOperation,
	movieBufferOperationSupported
} from './MovieAuthoring3dBufferOperations.js';
import { collectTargetMeshes } from './MovieAuthoring3dTargets.js';

export function applyMovieGeometryGraph(target, graph) {
	if (!target || !graph) return null;
	const evidence = (graph.nodes || []).map(node => applyObjectNode(target, node));
	for (const mesh of collectTargetMeshes(target)) {
		applyGraphToMesh(mesh, graph, evidence);
	}
	target.userData.movieGeometryGraph = {
		edgeCount: graph.edges?.length || 0,
		graphId: graph.id,
		nodes: evidence
	};
	return target.userData.movieGeometryGraph;
}

function applyObjectNode(target, node) {
	if (node.type === 'transform') {
		if (node.position) target.position?.set?.(...node.position);
		if (node.scale) target.scale?.set?.(...node.scale);
		return nodeEvidence(node, 'executed');
	}
	if (node.type === 'instance') {
		target.userData.instanceCount = Math.max(1, Number(node.count || 1));
		return nodeEvidence(node, 'executed');
	}
	if (node.type === 'distribute') {
		target.userData.distribution = {
			count: Math.max(1, Number(node.count || 1)),
			mode: node.mode || 'line',
			spacing: Number(node.spacing || 1)
		};
		return nodeEvidence(node, 'executed');
	}
	if (['input', 'output', 'setMaterial'].includes(node.type)) {
		return nodeEvidence(node, 'executed');
	}
	return nodeEvidence(node, movieBufferOperationSupported(node.type) ? 'pending-mesh' : 'preserved');
}

function applyGraphToMesh(mesh, graph, evidence) {
	const geometry = mesh.geometry;
	const position = geometry?.attributes?.position;
	if (!position?.array || !geometry?.setAttribute) return;
	geometry.userData ||= {};
	geometry.userData.movieGeometryGraphs ||= {};
	const state = geometry.userData.movieGeometryGraphs;
	state.source ||= new Float32Array(position.array);
	const signature = JSON.stringify(graph.nodes || []);
	let output = state.cache?.signature === signature
		? new Float32Array(state.cache.output)
		: evaluateNodes(state.source, graph.nodes || [], evidence);
	state.cache = { output: new Float32Array(output), signature };
	geometry.setAttribute(
		'position',
		new position.constructor(output, position.itemSize || 3)
	);
	geometry.attributes.position.needsUpdate = true;
}

function evaluateNodes(source, nodes, evidence) {
	let output = new Float32Array(source);
	for (const node of nodes) {
		if (!movieBufferOperationSupported(node.type)) continue;
		const next = applyMovieBufferOperation(output, node);
		if (!next) continue;
		output = next;
		const record = evidence.find(item => item.id === node.id);
		if (record) {
			record.status = 'executed';
			record.vertexCount = output.length / 3;
		}
	}
	return output;
}

function nodeEvidence(node, status) {
	return {
		id: node.id,
		status,
		type: node.type
	};
}
