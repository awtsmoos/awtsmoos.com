// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioAuthoring3dProject.js
 * @description Adds structured nodes, modifiers, textures, groups, and sculpt strokes to authoring JSON.
 * The Awtsmoos renews every chosen tool before hand or agent can claim it; Awtsmoos.com
 * keeps project mutation pure, bounded, and shared by desktop, mobile, automation, and tests.
 */

export function addMovieGeometryNode(source, type) {
	const graph = firstRecord(source, 'geometryGraphs', () => graphRecord('geometry-main'));
	graph.nodes ||= [];
	graph.nodes.push({ id: uniqueId(`geometry-${type}`), type });
	return source;
}

export function addMovieShaderNode(source, type) {
	const graph = firstRecord(source, 'shaderGraphs', () => graphRecord('shader-main'));
	graph.nodes ||= [];
	graph.nodes.push(defaultShaderNode(type));
	return source;
}

export function addMovieModifier(source, type) {
	const stack = firstRecord(source, 'modifierStacks', () => ({
		id: 'modifier-stack-main',
		modifiers: [],
		target: source.models?.[0]?.id || 'hero-chossid'
	}));
	stack.modifiers ||= [];
	stack.modifiers.push({ enabled: true, id: uniqueId(type), type });
	return source;
}

export function addMovieRemoteTexture(source, filename = 'tan cloth.png') {
	source.textures ||= [];
	source.textures.push({
		family: 'craft',
		filename,
		id: uniqueId('texture'),
		kind: 'remoteCatalog'
	});
	return source;
}

export function addMovieVertexGroup(source, selector = 'height:bottom-25%') {
	source.vertexGroups ||= [];
	source.vertexGroups.push({
		id: uniqueId('vertex-group'),
		selector,
		target: source.models?.[0]?.id || 'hero-chossid',
		weights: []
	});
	return source;
}

export function addMovieSculptStroke(source, brush, time = 0) {
	const layer = firstRecord(source, 'sculptLayers', () => ({
		brush,
		id: 'sculpt-main',
		strength: 0.15,
		strokes: [],
		target: source.models?.[0]?.id || 'hero-chossid'
	}));
	layer.brush = brush;
	layer.strokes ||= [];
	layer.strokes.push({
		center: [0, 1, 0],
		radius: 0.5,
		strength: 0.15,
		time
	});
	return source;
}

function firstRecord(source, key, factory) {
	source[key] ||= [];
	if (!source[key].length) source[key].push(factory());
	return source[key][0];
}

function graphRecord(id) {
	return { edges: [], id, nodes: [] };
}

function defaultShaderNode(type) {
	const node = { id: uniqueId(`shader-${type}`), type };
	if (type === 'color') node.value = '#60758f';
	if (type === 'grain') Object.assign(node, { scale: 18, strength: 0.08 });
	if (type === 'principled') Object.assign(node, { metallic: 0, roughness: 0.6 });
	return node;
}

function uniqueId(prefix) {
	return `${prefix}-${Date.now().toString(36)}`;
}
