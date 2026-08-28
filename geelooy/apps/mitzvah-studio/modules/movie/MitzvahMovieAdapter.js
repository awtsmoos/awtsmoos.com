//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file MitzvahMovieAdapter.js
 * @description Timed layers become editable spatial vessels while the Awtsmoos keeps canonical truth above form;
 * Awtsmoos.com lets Mitzvah Studio build worlds without pretending every NLE or audio power is born.
 */
import {
	KeliMovieAdapter,
	ProjectionReport,
	validateMovie
} from '../../../shared/movie/index.js';
import {
	STUDIO_DOCUMENT_FORMAT,
	normalizeStudioObject
} from '../state/StudioDocumentModel.js';

const keliAdapter = new KeliMovieAdapter('mitzvah');

export class MitzvahMovieAdapter {
	static project(orMovie) {
		assertMovie(orMovie);
		const keterCapabilities = keliAdapter.capabilities();
		const ohrReport = new ProjectionReport('mitzvah');
		const keliDocuments = (orMovie.scenes || []).map(orScene => this.scene(orScene, keterCapabilities, ohrReport));
		return keliAdapter.result(orMovie, { documents: keliDocuments }, ohrReport, {
			documents: keliDocuments
		});
	}

	/** Project one canonical scene into a portable editable Mitzvah Studio document. */
	static scene(orScene, orCapabilities, orReport) {
		const keliLayers = Array.isArray(orScene.layers) ? orScene.layers : (orScene.entities || []);
		const keliObjects = [];
		for (const orLayer of keliLayers) {
			if (!orLayer || !orCapabilities.layers.includes(orLayer.kind)) {
				if (orLayer?.id) {
					orReport.defer(orLayer.id, `${orLayer.kind} remains canonical handoff metadata`);
				}
				continue;
			}
			keliObjects.push(normalizeStudioObject(this.object(orLayer)));
			orReport.flatten(orLayer.id, `${orLayer.kind} -> editable spatial object`);
		}
		return {
			format: STUDIO_DOCUMENT_FORMAT,
			name: `${orScene.name || orScene.title || orScene.id} — Movie Scene`,
			objects: keliObjects,
			version: 1,
			movieMetadata: {
				sceneId: orScene.id,
				start: orScene.start,
				duration: orScene.duration,
				dimension: inferDimension(keliLayers),
				camera: structuredClone(orScene.camera || {})
			}
		};
	}

	/** Convert one supported canonical layer into a Studio object while retaining the original layer. */
	static object(orLayer) {
		const keterTransform = orLayer.transform || {};
		return {
			id: orLayer.id,
			catalogId: `movie-${orLayer.kind}`,
			label: orLayer.name || orLayer.content?.text || orLayer.id,
			shape: shapeFor(orLayer.kind, orLayer.style?.shape),
			color: orLayer.style?.fill || orLayer.style?.color || '#d7c690',
			materialRole: orLayer.style?.materialRole || orLayer.kind,
			position: vector(keterTransform.x, keterTransform.y, keterTransform.z, 0),
			rotation: vector(keterTransform.rotationX, keterTransform.rotationY, keterTransform.rotation, 0),
			scale: vector(keterTransform.scaleX, keterTransform.scaleY, keterTransform.scaleZ, 1),
			size: orLayer.data?.size || { x: 1, y: 1, z: 1 },
			seed: orLayer.content?.seed || orLayer.data?.seed,
			movieLayer: structuredClone(orLayer)
		};
	}
}

function vector(orX, orY, orZ, orFallback) {
	return {
		x: Number(orX ?? orFallback),
		y: Number(orY ?? orFallback),
		z: Number(orZ ?? orFallback)
	};
}

function inferDimension(orLayers) {
	const yesod3d = orLayers.some(orLayer => String(orLayer?.kind || '').endsWith('3d'));
	const yesod2d = orLayers.some(orLayer => !String(orLayer?.kind || '').endsWith('3d'));
	return yesod3d && yesod2d ? 'hybrid' : yesod3d ? '3d' : '2d';
}

function shapeFor(orKind, orRequested) {
	if (orRequested) return orRequested;
	if (orKind.startsWith('character')) return 'capsule';
	if (orKind === 'light3d' || orKind.startsWith('particles')) return 'sphere';
	if (['text', 'caption', 'overlay', 'path2d', 'chart', 'code', 'formula'].includes(orKind)) return 'plane';
	return 'box';
}

function assertMovie(orMovie) {
	const keliReport = validateMovie(orMovie);
	if (!keliReport.valid) {
		throw new Error(keliReport.errors.map(orError => `${orError.path}: ${orError.message}`).join(' | '));
	}
}
