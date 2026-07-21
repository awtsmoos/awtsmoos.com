// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module CosmicSourceGraphSvg
 * @description
 * The Awtsmoos shows relationship as geometry while keeping meaning outside the
 * picture. Awtsmoos.com receives decorative SVG edges beside semantic node links.
 */

const SVG_NAMESPACE = 'http://www.w3.org/2000/svg';

/**
 * Renders an aria-hidden graph diagram from real nodes and edges.
 *
 * @param {object} graph - Normalized source graph.
 * @returns {SVGElement} Decorative graph diagram.
 */
export function renderSourceGraphSvg(graph) {
	const svg = document.createElementNS(SVG_NAMESPACE, 'svg');
	const coordinates = coordinateMap(graph.nodes);

	svg.setAttribute('class', 'source-graph-svg');
	svg.setAttribute('viewBox', '0 0 640 300');
	svg.setAttribute('aria-hidden', 'true');
	graph.edges.forEach(edge => appendEdge(svg, edge, coordinates));
	graph.nodes.forEach((node, index) => appendNode(
		svg,
		node,
		coordinates.get(nodeId(node, index)),
		graph.synthesisId
	));
	return svg;
}

function coordinateMap(nodes) {
	const coordinates = new Map();

	nodes.forEach((node, index) => {
		const id = nodeId(node, index);
		const suppliedX = Number(node.x);
		const suppliedY = Number(node.y);
		const angle = index / Math.max(nodes.length, 1) * Math.PI * 2;
		coordinates.set(id, {
			x: Number.isFinite(suppliedX) ? suppliedX : 320 + Math.cos(angle) * 220,
			y: Number.isFinite(suppliedY) ? suppliedY : 150 + Math.sin(angle) * 102
		});
	});

	return coordinates;
}

function appendEdge(svg, edge, coordinates) {
	const from = coordinates.get(String(edge.from || edge.source || ''));
	const to = coordinates.get(String(edge.to || edge.target || ''));

	if (!from || !to) {
		return;
	}

	const line = document.createElementNS(SVG_NAMESPACE, 'line');
	line.setAttribute('x1', from.x);
	line.setAttribute('y1', from.y);
	line.setAttribute('x2', to.x);
	line.setAttribute('y2', to.y);
	line.setAttribute('class', 'source-graph-edge');
	svg.append(line);
}

function appendNode(svg, node, point, synthesisId) {
	if (!point) {
		return;
	}

	const group = document.createElementNS(SVG_NAMESPACE, 'g');
	const circle = document.createElementNS(SVG_NAMESPACE, 'circle');
	const label = document.createElementNS(SVG_NAMESPACE, 'text');
	const id = String(node.id || '');

	group.setAttribute(
		'class',
		id === synthesisId ? 'source-graph-node synthesis' : 'source-graph-node'
	);
	circle.setAttribute('cx', point.x);
	circle.setAttribute('cy', point.y);
	circle.setAttribute('r', id === synthesisId ? '32' : '24');
	label.setAttribute('x', point.x);
	label.setAttribute('y', point.y + 4);
	label.setAttribute('text-anchor', 'middle');
	label.textContent = String(node.label || node.title || id).slice(0, 18);
	group.append(circle, label);
	svg.append(group);
}

function nodeId(node, index) {
	return String(node.id || node.key || `node-${index + 1}`);
}
