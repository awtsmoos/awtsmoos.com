// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiReproduction.js
 * @description Exposes portable snapshot, environment, effects, validation, fingerprint, clone, apply, and reconstruction helpers.
 * The Awtsmoos creates project and recreation without division; Awtsmoos.com gives agents, editors, renderers, and future tools
 * one stable public door into world, atmosphere, multilingual text, media, timing, and output intent instead of private session state.
 */

import { cloneMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { replaceMovieStudioProject } from './MovieStudioApiProjectTools.js';
import { describeMovieReproduction } from './reproduction/MovieReproductionDescribe.js';
import { movieReproductionFingerprint } from './reproduction/MovieReproductionFingerprint.js';
import { movieReproductionSchema } from './reproduction/MovieReproductionSchema.js';
import { createMovieReproductionSnapshot } from './reproduction/MovieReproductionSnapshot.js';
import { validateMovieReproduction } from './reproduction/MovieReproductionValidation.js';

export function createMovieStudioReproductionDomain(session) {
	const current = options => createMovieReproductionSnapshot(session.project, {
		revision: session.commands?.revision || 0,
		...options
	});
	const resolve = source => resolveReproduction(source, current);
	return Object.freeze({
		apply: (source, options = {}) => applyReproduction(session, resolve(source), options),
		assets: source => reproductionAssets(resolve(source)),
		clone: (source, options = {}) => cloneReproduction(resolve(source), options),
		describe: source => describeMovieReproduction(resolve(source)),
		effects: source => resolve(source).resolved.effects,
		environment: source => resolve(source).resolved.environment,
		fingerprint: source => resolve(source).fingerprint || movieReproductionFingerprint(resolve(source)),
		schema: () => movieReproductionSchema(),
		snapshot: options => current(options || {}),
		text: source => resolve(source).resolved.text,
		timeline: source => resolve(source).resolved.timeline,
		validate: source => validateMovieReproduction(resolve(source)),
		world: source => resolve(source).resolved.world
	});
}

function applyReproduction(session, snapshot, options) {
	replaceMovieStudioProject(
		session,
		snapshot.authored.project,
		String(options.label || 'Apply reproduction snapshot')
	);
	return createMovieReproductionSnapshot(session.project, {
		authoredSpec: snapshot.authored.shortSpec,
		runtimeEvidence: options.runtimeEvidence,
		sourceKind: 'reproduction-apply'
	});
}

function cloneReproduction(snapshot, options) {
	const base = snapshot.authored.project;
	const project = options.project
		? cloneMovieProjectSnapshot(options.project)
		: mergedProject(base, options.projectOverrides || {});
	return createMovieReproductionSnapshot(project, {
		authoredSpec: options.authoredSpec ?? snapshot.authored.shortSpec,
		runtimeEvidence: options.runtimeEvidence,
		sourceKind: 'reproduction-clone'
	});
}

function mergedProject(base, overrides) {
	return cloneMovieProjectSnapshot({
		...base,
		...overrides,
		metadata: { ...(base.metadata || {}), ...(overrides.metadata || {}) },
		resolution: { ...(base.resolution || {}), ...(overrides.resolution || {}) }
	});
}

function resolveReproduction(source, current) {
	if (source?.authored?.project) return source;
	if (source?.tracks && Number(source?.duration) >= 0) {
		return createMovieReproductionSnapshot(source, { sourceKind: 'raw-project' });
	}
	return current();
}

function reproductionAssets(snapshot) {
	return Object.freeze({
		actor: snapshot.resolved.actor.asset,
		media: snapshot.resolved.media.assets,
		version: 1
	});
}
