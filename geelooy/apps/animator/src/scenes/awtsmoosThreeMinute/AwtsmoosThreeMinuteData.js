//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file AwtsmoosThreeMinuteData.js
 * @description The Awtsmoos preserves an already-authored three-minute world while its milliseconds enter canonical seconds;
 * Awtsmoos.com performs only structural alias conversion—IDs, units, enums, and layers—never story invention or linguistic ends.
 */
import {
	createMovieDocument,
	validateMovie
} from '../../../../shared/movie/index.js';
import { createAwtsmoosThreeMinuteIntent } from './AwtsmoosThreeMinuteIntent.js';
import { yesodShowcaseLayer } from './AwtsmoosThreeMinuteLayerAdapter.js';

const MILLISECOND_SCALE = 0.001;

/** @returns {object} Canonical movie preserving every explicit showcase scene, entity, camera, and transition. */
export function createAwtsmoosThreeMinuteData() {
	const source = createAwtsmoosThreeMinuteIntent();
	const movie = createMovieDocument({
		id: source.id,
		metadata: {
			title: source.title,
			description: source.subject,
			goal: source.goal,
			audience: source.audience,
			...(source.metadata || {})
		},
		format: format(source.settings || source.format || {}),
		duration: seconds(source.duration),
		cast: structuredClone(source.cast || []),
		assets: structuredClone(source.assets || []),
		features: structuredClone(source.features || {}),
		handoff: structuredClone(source.handoff || {}),
		scenes: (source.scenes || []).map(sceneData)
	});
	const report = validateMovie(movie);
	if (!report.valid) {
		throw new Error(report.errors.map(issue => `${issue.path}: ${issue.message}`).join(' | '));
	}
	return movie;
}

function sceneData(scene, index) {
	const cameras = (scene.cameras || []).map(cameraData);
	return {
		...structuredClone(scene),
		id: scene.id || `showcase-scene-${index + 1}`,
		start: seconds(scene.start),
		duration: seconds(scene.duration),
		transition: transitionData(scene.transition),
		camera: cameraData(scene.camera || cameras[0] || {}),
		cameras,
		entities: (scene.entities || []).map(entityData),
		layers: (scene.entities || []).map((entity, entityIndex) => {
			return yesodShowcaseLayer(entity, scene.dimension, MILLISECOND_SCALE, entityIndex);
		})
	};
}

function entityData(entity) {
	return {
		...structuredClone(entity),
		start: seconds(entity.start),
		duration: seconds(entity.duration),
		keyframes: (entity.keyframes || []).map(frame => ({
			...structuredClone(frame),
			at: seconds(frame.at)
		}))
	};
}

function cameraData(camera = {}) {
	const sizeAliases = {
		'extreme-wide': 'wide',
		'close-up': 'closeup',
		detail: 'extreme-closeup',
		'over-shoulder': 'medium'
	};
	const angleAliases = {
		'bird-eye': 'overhead',
		overhead: 'overhead',
		high: 'high-angle',
		low: 'low-angle'
	};
	return {
		...structuredClone(camera),
		kind: angleAliases[camera.angle] || sizeAliases[camera.size] || camera.kind || camera.size || 'wide',
		move: camera.move || camera.motion || 'static',
		start: seconds(camera.start),
		duration: seconds(camera.duration)
	};
}

function transitionData(transition = {}) {
	return {
		...structuredClone(transition),
		kind: transition.kind || transition.type || 'cut',
		duration: seconds(transition.duration)
	};
}

function format(settings) {
	return {
		width: Number(settings.width) || 1280,
		height: Number(settings.height) || 720,
		fps: Number(settings.fps) || 24,
		orientation: settings.orientation || 'landscape',
		safeArea: Number(settings.safeArea ?? 0.06)
	};
}

function seconds(value) {
	const number = Number(value || 0);
	return Number.isFinite(number) ? number * MILLISECOND_SCALE : 0;
}
