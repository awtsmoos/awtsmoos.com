// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiAgentPlanning.js
 * @description Exposes prompt generation, world specs, recipes, plans, dry runs, deltas, and atomic application.
 * The Awtsmoos is beyond plan and deed while every finite agent deserves an inspectable and reversible bridge;
 * Awtsmoos.com lets JSON callers generate living worlds, preview consequences, and commit one guarded project ridge.
 */

import {
	applyMovieEditPlan,
	previewMovieEditPlan
} from './MovieEditPlanExecutor.js';
import { compileProceduralMovie } from './MovieProceduralCompiler.js';
import { compileMovieRecipe } from './MovieRecipeCompiler.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';
import { compileMovieWorldPrompt } from './MovieWorldPromptCompiler.js';

export function createMovieStudioAgentPlanningDomain(session) {
	return {
		applyPlan: (plan, options = {}) => operation(
			session,
			'agent.applyPlan',
			options,
			() => applyMovieEditPlan(session, plan, options)
		),
		applyRecipe: (recipe, options = {}) => operation(
			session,
			'agent.applyRecipe',
			options,
			() => applyMovieEditPlan(
				session,
				compileMovieRecipe(recipe, { revision: session.revision }),
				options
			)
		),
		compileRecipe: (recipe, options = {}) => operation(
			session,
			'agent.compileRecipe',
			options,
			() => compileMovieRecipe(recipe, { revision: session.revision })
		),
		generatePrompt: (prompt, options = {}) => operation(
			session,
			'agent.generatePrompt',
			options,
			() => applyProceduralMovie(session, prompt, options)
		),
		previewPlan: (plan, options = {}) => operation(
			session,
			'agent.previewPlan',
			options,
			() => previewMovieEditPlan(session, plan, options)
		),
		previewRecipe: (recipe, options = {}) => operation(
			session,
			'agent.previewRecipe',
			options,
			() => previewMovieEditPlan(
				session,
				compileMovieRecipe(recipe, { revision: session.revision }),
				options
			)
		),
		procedural: (prompt, options = {}) => operation(
			session,
			'agent.procedural',
			options,
			() => compileProceduralMovie(prompt, options)
		),
		world: (prompt, options = {}) => operation(
			session,
			'agent.world',
			options,
			() => compileMovieWorldPrompt(prompt, options)
		)
	};
}

function applyProceduralMovie(session, prompt, options) {
	const generated = compileProceduralMovie(prompt, options);
	session.commands.commitProject(
		generated.project,
		options.label || 'Generate procedural MitzvahWorld movie'
	);
	session.events.emit('agent:procedural-generated', {
		regions: generated.explanation.regions,
		revision: session.revision,
		seed: generated.explanation.seed,
		title: generated.project.title
	});
	return createMovieProjectSnapshot({
		...generated,
		project: session.project,
		revision: session.revision
	});
}

function operation(session, name, options, action) {
	return runMovieStudioApiOperation(session, name, options, action);
}
