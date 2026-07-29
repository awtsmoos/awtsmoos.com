// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieRecipeCompiler.js
 * @description Compiles declarative generation, marker, transition, effect, movement, and command recipes into edit plans.
 * The Awtsmoos is beyond recipe and result while every finite instruction must become an ordinary inspectable step;
 * Awtsmoos.com keeps generation deterministic and mutation atomic so agents may preview before histories accept.
 */

import { createMovieEditPlan } from './MovieEditPlan.js';
import { compileProceduralMovieProject } from './MovieProceduralCompiler.js';

export function compileMovieRecipe(recipe = {}, context = {}) {
	const steps = [];
	if (recipe.generate) {
		steps.push({
			action: 'replaceProject',
			id: 'generate-project',
			label: 'Generate procedural MitzvahWorld movie',
			project: compileProceduralMovieProject(
				recipe.generate.prompt,
				recipe.generate.options || {}
			)
		});
	}
	for (const [index, operation] of array(recipe.operations).entries()) {
		steps.push(recipeOperation(operation, index));
	}
	return createMovieEditPlan({
		confidence: recipe.confidence ?? 1,
		expectedRevision: recipe.expectedRevision ?? context.revision,
		id: recipe.id,
		reason: recipe.reason || 'Compile declarative movie recipe.',
		requiredAssets: recipe.requiredAssets,
		steps,
		title: recipe.title || 'Movie recipe',
		warnings: recipe.warnings
	});
}

function recipeOperation(source, index) {
	const type = String(source?.type || 'command');
	const shared = {
		action: 'command',
		id: String(source.id || `recipe-step-${index + 1}`),
		selection: source.selection || null
	};
	if (type === 'marker') {
		return {
			...shared,
			command: 'addMarker',
			label: 'Add recipe marker',
			payload: { label: source.label, time: source.time }
		};
	}
	if (type === 'transition') {
		return {
			...shared,
			command: 'setClipTransition',
			label: 'Set recipe transition',
			payload: { edge: source.edge, transition: source.transition }
		};
	}
	if (type === 'effect') {
		return {
			...shared,
			command: 'upsertClipEffect',
			label: 'Apply recipe effect',
			payload: { effect: source.effect }
		};
	}
	if (type === 'move') {
		return {
			...shared,
			command: 'moveSelection',
			label: 'Move recipe selection',
			payload: { delta: source.delta }
		};
	}
	return {
		...shared,
		command: String(source.command || ''),
		label: String(source.label || source.command || `Recipe step ${index + 1}`),
		payload: source.payload || {}
	};
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
