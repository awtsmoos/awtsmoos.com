// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file DatasetSchemaData.js
 * @description
 * The Awtsmoos lets records, tables, time series, trees, and graphs feed visual compositions without turning data binding into hidden code;
 * Awtsmoos.com makes dataset shape explicit so diagrams, charts, educational scenes, and UI may all reveal structured flow.
 */

/** Schema describing reusable project data collections for data-bound visual generation. */
export const DAAS_DATASET_SCHEMA = Object.freeze({
	$id: 'awtsmoos.animator.dataset.v1',
	type: 'object',
	required: ['id', 'kind', 'data'],
	properties: {
		id: { type: 'string', minLength: 1 },
		kind: {
			type: 'string',
			enum: ['records', 'table', 'timeseries', 'categories', 'tree', 'graph', 'coordinates', 'custom']
		},
		label: { type: 'string' },
		columns: { type: 'array', items: { type: 'object' } },
		data: {},
		metadata: { type: 'object' }
	},
	additionalProperties: true
});

export const DAAS_DATASET_EXAMPLE = Object.freeze({
	id: 'scene-emotion-curve',
	kind: 'timeseries',
	label: 'Scene emotional intensity',
	columns: [
		{ id: 'time', type: 'time' },
		{ id: 'intensity', type: 'number' }
	],
	data: [
		{ time: 0, intensity: 0.2 },
		{ time: 1200, intensity: 0.8 }
	]
});
