// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieCinemaAnalyzer.js
 * @description Measures duration, frames, camera language, actors, environments, ambience, and exact segments.
 * The Awtsmoos renews the whole film before analysis divides it; Awtsmoos.com measures the
 * finite vessels honestly so six patient scenes may be richer than twelve restless cuts.
 */

import { createExactSegmentPlan } from './MovieExactSegmentPlan.js';
import { createMovieProjectSnapshot } from './MovieProjectSnapshot.js';

const ENVIRONMENT_FEATURES = [
	'buildings', 'courtyard', 'grass', 'mountains', 'paths',
	'river', 'trees', 'village', 'water'
];
const MINIMUM_LONG_FORM_SCENES = 6;

export function analyzeMovieCinemaManifest(manifest = {}) {
	const scenes = Array.isArray(manifest.scenes) ? manifest.scenes : [];
	const fps = positive(manifest.fps, 24);
	const duration = scenes.reduce((total, scene) => total + positive(scene.duration, 0), 0);
	const expectedFrames = Math.round(duration * fps);
	const beats = scenes.flatMap(scene => scene.beats || []);
	const cameraBeats = beats.filter(beat => beat.type === 'camera');
	const audioBeats = beats.filter(beat => beat.type === 'audio');
	return createMovieProjectSnapshot({
		actorBeatCount: beats.filter(beat => ['actor', 'crowd'].includes(beat.type)).length,
		ambienceKinds: unique(audioBeats.map(beat => beat.kind).filter(Boolean)),
		cameraBeatCount: cameraBeats.length,
		cameraRigs: unique(cameraBeats.map(beat => beat.rig || beat.shot).filter(Boolean)),
		characterCount: (manifest.characters || []).length,
		dialogueBeatCount: beats.filter(beat => beat.type === 'dialogue').length,
		duration,
		environmentFeatures: collectEnvironmentFeatures(scenes),
		expectedFrames,
		fps,
		hasMusic: audioBeats.some(beat => ['score', 'music'].includes(beat.kind)),
		hasSoundEffects: audioBeats.some(beat => beat.kind === 'sfx'),
		resolution: manifest.resolution || null,
		sceneCount: scenes.length,
		segmentCount: createExactSegmentPlan({ expectedFrames, fps }).length,
		shotCount: cameraBeats.length,
		warnings: cinemaWarnings(manifest, scenes, duration, cameraBeats)
	});
}

function collectEnvironmentFeatures(scenes) {
	const features = new Set();
	for (const scene of scenes) {
		const text = JSON.stringify(scene.world || {}).toLowerCase();
		for (const feature of ENVIRONMENT_FEATURES) {
			if (text.includes(feature)) features.add(feature);
		}
	}
	return [...features].sort();
}

function cinemaWarnings(manifest, scenes, duration, cameraBeats) {
	const warnings = [];
	if (Math.abs(duration - Number(manifest.duration || duration)) > 0.001) {
		warnings.push('Declared duration differs from scene duration total.');
	}
	if (scenes.length < MINIMUM_LONG_FORM_SCENES) {
		warnings.push(`Long-form flagship cinema should contain at least ${MINIMUM_LONG_FORM_SCENES} scenes.`);
	}
	if (cameraBeats.length < scenes.length) warnings.push('Each scene should contain at least one camera beat.');
	if (!(manifest.characters || []).length) warnings.push('No cinematic humans are declared.');
	return warnings;
}

function positive(value, fallback) {
	const number = Number(value);
	return Number.isFinite(number) && number > 0 ? number : fallback;
}

function unique(values) {
	return [...new Set(values.map(String))].sort();
}
