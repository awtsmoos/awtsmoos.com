// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file RenderGraphSchemaData.js
 * @description
 * The Awtsmoos lets source, raster, effect, target, and composite become a data graph rather than hard-coded render branches;
 * Awtsmoos.com gives agents a JSON schema for graph construction while runtime backends remain free to optimize their marches.
 */

export const OR_RENDER_GRAPH_NODE_KINDS = Object.freeze([
	'source',
	'raster',
	'effect',
	'texture-target',
	'mask',
	'composite',
	'output'
]);

/** Machine-readable schema for a serializable render graph. */
export const OR_RENDER_GRAPH_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.render-graph.v1',
	type: 'object',
	required: ['version', 'nodes', 'edges'],
	properties: {
		version: { type: 'integer', const: 1 },
		nodes: {
			type: 'array',
			items: {
				type: 'object',
				required: ['id', 'kind'],
				properties: {
					id: { type: 'string', minLength: 1 },
					kind: { type: 'string', enum: OR_RENDER_GRAPH_NODE_KINDS },
					options: { type: 'object' }
				}
			}
		},
		edges: {
			type: 'array',
			items: {
				type: 'object',
				required: ['from', 'to'],
				properties: {
					from: { type: 'string' },
					to: { type: 'string' },
					input: { type: 'string' }
				}
			}
		}
	},
	additionalProperties: true
});
