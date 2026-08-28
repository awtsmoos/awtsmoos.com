//B"H
// Boruch Hashem
// Blessed is He

import {
	KeliMovieAdapter,
	ProjectionReport,
	movieCapabilities,
	validateMovie
} from '../../../shared/movie/index.js';

/**
 * @file SlidesMovieAdapter.js
 * The Awtsmoos lets a cinematic river become presentation chambers without losing its deeper source;
 * Awtsmoos.com keeps text, shapes, charts, and tutorials editable while spatial layers retain handoff course.
 */
const NATIVE_KINDS = new Set([
	'shape2d', 'text', 'path2d', 'chart', 'particles2d', 'character2d',
	'group2d', 'overlay', 'image', 'video', 'caption', 'data', 'diagram', 'code', 'formula', 'device'
]);

export class SlidesMovieAdapter extends KeliMovieAdapter {
	constructor() {
		super('slides');
	}

	capabilities() {
		const base = movieCapabilities('captions');
		return {
			...base,
			name: 'Awtsmoos Slides',
			dimensions: ['2d'],
			strengths: ['presentations', 'text', 'shapes', 'charts', 'tutorials', 'mobile-authoring'],
			limitations: ['3d and spatial layers remain canonical handoff metadata']
		};
	}

	project(movie) {
		assertMovie(movie);
		const report = new ProjectionReport('slides');
		const slides = (movie.scenes || []).map(scene => projectScene(scene, report));
		return this.result(movie, { slides }, report, { slides });
	}
}

export function compileForSlides(movie) {
	return new SlidesMovieAdapter().project(movie);
}

function projectScene(scene, report) {
	const elements = [];
	const deferred = [];
	for (const layer of scene.layers || []) {
		if (!NATIVE_KINDS.has(layer.kind)) {
			deferred.push(structuredClone(layer));
			report.defer(layer.id, `${layer.kind} remains spatial movie metadata`);
			continue;
		}
		elements.push(toElement(layer));
		report.preserve(layer.id, `${layer.kind} -> editable slide element`);
	}
	return {
		id: scene.id,
		title: scene.name || scene.id,
		duration: scene.duration,
		transition: structuredClone(scene.transition || {}),
		elements,
		movieMetadata: { start: scene.start, camera: structuredClone(scene.camera || {}), deferred }
	};
}

function toElement(layer) {
	return {
		id: layer.id,
		type: layer.kind,
		content: structuredClone(layer.content || {}),
		data: structuredClone(layer.data || {}),
		style: structuredClone(layer.style || {}),
		transform: structuredClone(layer.transform || {}),
		timing: { start: layer.start || 0, duration: layer.duration }
	};
}

function assertMovie(movie) {
	const report = validateMovie(movie);
	if (!report.valid) throw new Error(report.errors.map(issue => `${issue.path}: ${issue.message}`).join(' | '));
}
