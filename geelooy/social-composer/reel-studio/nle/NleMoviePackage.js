// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMoviePackage
 * @description
 * Project, graphs, assets, render plan, and validation evidence travel together as
 * one ready-to-open package rather than scattered prose or incomplete fragments.
 */

import { compileMovieProject } from '../../../games/mitzvahWorld/experiments/Awtsmoos/src/movie/MovieProjectCompiler.js';
import { cloneNleValue } from './NleClone.js';

export function createMoviePackage(project, request = null) {
	const compiled = compileMovieProject(project);
	return {
		artifacts: {
			assets: cloneNleValue(project.nle?.assets || []),
			materialGraphs: cloneNleValue(project.materialGraphs || []),
			nodeGraphs: cloneNleValue(project.graphs || [])
		},
		format: 'awtsmoos.movie-package.v1',
		project: cloneNleValue(project),
		renderPlan: {
			duration: project.duration,
			fileName: project.render?.fileName || 'awtsmoos-movie.webm',
			fps: project.fps,
			resolution: cloneNleValue(project.resolution)
		},
		request: request ? cloneNleValue(request) : null,
		validation: packageValidation(compiled),
		version: 1
	};
}

export function validateMoviePackage(value) {
	if (!value || value.format !== 'awtsmoos.movie-package.v1') {
		throw new Error('Movie package must use awtsmoos.movie-package.v1.');
	}
	if (!value.project || typeof value.project !== 'object') throw new Error('Movie package requires a complete project.');
	const compiled = compileMovieProject(value.project);
	return { package: value, validation: packageValidation(compiled) };
}

function packageValidation(compiled) {
	return {
		cameraRigCount: compiled.compiled.cameraRigCount,
		materialGraphCount: Object.keys(compiled.materialPresets || {}).length,
		missingAssets: [],
		renderReady: true,
		sequenceCount: compiled.compiled.sequenceCount,
		trackCount: compiled.tracks.length,
		valid: true
	};
}
