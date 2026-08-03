// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioApiCinema.js
 * @description Composes preparation, safety, authoring, codec, installation, and render jobs into one frozen cinema domain.
 * The Awtsmoos renews asset, intent, project, queue, and artifact beyond their useful divisions;
 * Awtsmoos.com gives agents one surface while final Chossid readiness and trusted executors remain canonical.
 */

import { compileMovieAgentManifest } from './MovieAgentCompiler.js';
import { analyzeMovieCinemaManifest } from './MovieCinemaAnalyzer.js';
import { createMovieCinemaCodecReport } from './MovieCinemaCodecReport.js';
import { createMovieCinemaContract } from './MovieCinemaContract.js';
import { createMovieCinemaFlagship } from './MovieCinemaFlagship.js';
import {
	assertMovieCinemaHumans,
	validateMovieCinemaHumans
} from './MovieCinemaHumanSafety.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';
import { createMovieStudioCinemaAssetDomain } from './MovieStudioApiCinemaAssets.js';
import { createMovieStudioCinemaRenderDomain } from './MovieStudioApiCinemaRender.js';
import { runMovieStudioApiOperation } from './MovieStudioApiOperation.js';

export function createMovieStudioCinemaDomain(session) {
	const assets = createMovieStudioCinemaAssetDomain(session);
	const render = createMovieStudioCinemaRenderDomain(session, async options => {
		const manifest = createMovieCinemaFlagship(options);
		const prepared = await assets.methods.prepare(manifest, options);
		if (!prepared.ok) throw prepared.error;
		return installCinema(session, manifest, options, assets, prepared.value);
	});
	return Object.freeze({
		analyze: manifest => analyzeMovieCinemaManifest(resolveManifest(manifest)),
		apply: (manifest, options = {}) => applyCinema(session, manifest, options, assets),
		assetStatus: manifest => assets.methods.assetStatus(resolveManifest(manifest)),
		capabilities: () => createMovieCinemaContract().capabilities,
		codecReport: (manifest, canvas) => codecReport(manifest, canvas),
		compile: (manifest, options = {}) => runMovieStudioApiOperation(
			session,
			'cinema.compile',
			options,
			() => compileCinema(manifest)
		),
		contract: () => createMovieCinemaContract(),
		flagship: options => createMovieCinemaFlagship(options),
		prepare: (manifest, options = {}) => assets.methods.prepare(resolveManifest(manifest), options),
		renderPlan: manifest => renderPlan(resolveManifest(manifest)),
		validate: manifest => validateCinema(resolveManifest(manifest)),
		...render
	});
}

function applyCinema(session, manifest, options, assets) {
	return runMovieStudioApiOperation(session, 'cinema.apply', options, () => {
		const installed = installCinema(session, resolveManifest(manifest), options, assets);
		return createMovieProjectSnapshot({
			analysis: installed.analysis,
			assets: installed.assets,
			project: session.project,
			revision: session.revision
		});
	});
}

function installCinema(session, manifest, options, assets, preparedAssets = null) {
	const project = compileCinema(manifest);
	const analysis = analyzeMovieCinemaManifest(manifest);
	const readyAssets = preparedAssets || assets.assertReady(manifest);
	session.commands.commitProject(project, options.label || 'Apply cinematic movie');
	session.events?.emit('cinema:applied', {
		expectedFrames: analysis.expectedFrames,
		revision: session.revision,
		sceneCount: analysis.sceneCount,
		title: project.title
	});
	return { analysis, assets: readyAssets, project };
}

async function codecReport(manifest, canvas) {
	const project = compileCinema(manifest);
	return createMovieCinemaCodecReport(project, canvas || project.resolution);
}

function compileCinema(manifest) {
	const resolved = resolveManifest(manifest);
	assertMovieCinemaHumans(resolved, { finalMode: true });
	return compileMovieAgentManifest(resolved);
}

function renderPlan(manifest) {
	return createMovieProjectSnapshot({
		...analyzeMovieCinemaManifest(manifest),
		codec: 'vp8',
		container: 'ivf',
		keyframeEverySeconds: 2,
		maximumEncodeQueue: 12,
		segmentDuration: 15
	});
}

function validateCinema(manifest) {
	const humans = validateMovieCinemaHumans(manifest, { finalMode: true });
	const analysis = analyzeMovieCinemaManifest(manifest);
	let compileError = null;
	try { compileMovieAgentManifest(manifest); } catch (error) { compileError = String(error?.message || error); }
	return createMovieProjectSnapshot({ analysis, compileError, humans, valid: humans.safe && !compileError });
}

function resolveManifest(manifest) {
	return manifest || createMovieCinemaFlagship();
}
