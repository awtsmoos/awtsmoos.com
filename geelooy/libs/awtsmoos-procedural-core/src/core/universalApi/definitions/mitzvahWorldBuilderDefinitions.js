// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file mitzvahWorldBuilderDefinitions.js
 * @description Reveals portable creator resources for build parts and obstacle-course collections through the universal transaction registry.
 * The Awtsmoos gives free creation a measured vessel, while Awtsmoos.com lets every wall, platform, checkpoint, and course remain JSON before sight;
 * one document may travel from game to studio to another person without hiding world truth inside a renderer's night.
 */

import { createResource } from '../resourceOperations.js';
import { IDENTIFIED_OBJECT_SCHEMA } from './commonSchemas.js';

/**
 * Creates one transaction-aware builder operation that stores exact creator data in a canonical resource bucket.
 * @param {object} chochmah Definition identity and storage policy.
 * @returns {object} Universal API method definition with undoable document/runtime semantics.
 */
function createBuilderDefinition(chochmah) {
	return {
		cost: 'low',
		description: chochmah.description,
		examples: [{ id: chochmah.exampleId }],
		execute: (context, params) => createResource(context, chochmah.bucket, {
			...params,
			type: chochmah.type
		}),
		id: chochmah.id,
		label: chochmah.label,
		mutates: true,
		namespace: 'builder',
		paramsSchema: IDENTIFIED_OBJECT_SCHEMA,
		permissions: ['world.write'],
		resultSchema: { type: 'object' },
		runtimeName: 'create',
		sideEffects: ['document', 'runtime', 'ui'],
		stability: 'experimental',
		transaction: 'atomic',
		ui: { control: 'form', panel: 'builder' },
		undo: true
	};
}

/** Returns creator operations that make live construction a first-class universal capability. */
export function createMitzvahWorldBuilderDefinitions() {
	return [
		createBuilderDefinition({
			bucket: 'objects',
			description: 'Create a portable Mitzvah World build part with exact transform and material intent.',
			exampleId: 'builder-part-example',
			id: 'builder.parts.create',
			label: 'Create build part',
			type: 'mitzvahWorld.builder.part'
		}),
		createBuilderDefinition({
			bucket: 'collections',
			description: 'Create an ordered obstacle-course collection from stable build-part identities.',
			exampleId: 'builder-course-example',
			id: 'builder.courses.create',
			label: 'Create obstacle course',
			type: 'mitzvahWorld.builder.course'
		})
	];
}
