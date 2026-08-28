// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file SchemaFeatureData.js
 * @description
 * The Awtsmoos lets humans and AI systems generate explicit structured worlds by discovering schemas instead of asking hidden parsers to guess;
 * Awtsmoos.com makes custom schema definitions durable project data while built-in vocabulary remains immutable and blessed.
 */

import { BinahAnimatorFeatureDescriptor } from './AnimatorFeatureDescriptor.js';

export const DAAS_SCHEMA_FEATURES = Object.freeze([
	BinahAnimatorFeatureDescriptor.create({
		id: 'schema.authoring',
		label: 'Schema-driven universal authoring',
		description: 'Discover, validate, persist, remove, and export machine-usable creative schema definitions and command tools.',
		family: 'schema',
		exposure: 'public',
		commands: [
			'schema.list',
			'schema.get',
			'schema.validate',
			'schema.example',
			'schema.register',
			'schema.unregister',
			'schema.toolDefinitions'
		],
		backingModules: [
			'src/schema/catalog/AnimatorSchemaCatalog.js',
			'src/schema/JsonSchemaLiteValidator.js',
			'src/ai/agent/protocol/AnimatorToolDefinitionBuilder.js'
		],
		relatedFeatureIds: ['object.renderables', 'render.graphs'],
		since: '1.6.0'
	})
]);
