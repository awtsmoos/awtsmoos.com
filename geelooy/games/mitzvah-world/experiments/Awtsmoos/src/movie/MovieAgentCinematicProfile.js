// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieAgentCinematicProfile.js
 * @description Enriches opt-in agent scenes with deterministic supported camera rigs, ambience, markers, and worlds.
 * The Awtsmoos renews every scene before shot and sound can claim a separate throne;
 * Awtsmoos.com turns bounded intention into repeatable cinema without changing manifests that stand alone.
 */

const DEFAULT_RIGS = [
	'aerialPullback',
	'craneReveal',
	'dollyIn',
	'handheldDrift',
	'orbitLeft',
	'orbitRight',
	'sideTrack'
];

export function enrichMovieAgentManifest(manifest) {
	if (!manifest.generation?.cinematic) return manifest;
	const profile = manifest.generation;
	const rigs = array(profile.cameraRigs).length
		? array(profile.cameraRigs).map(String)
		: DEFAULT_RIGS;
	const scenes = array(manifest.scenes).map((scene, index) => (
		enrichScene(scene, index, profile, rigs)
	));
	return {
		...manifest,
		markers: [...array(manifest.markers), ...sceneMarkers(scenes)],
		scenes
	};
}

function enrichScene(scene, index, profile, rigs) {
	const beats = array(scene.beats).map(beat => ({ ...beat }));
	const duration = Number(scene.duration);
	if (!beats.some(beat => beat.type === 'camera')) {
		beats.unshift({
			duration,
			id: `${sceneId(scene, index)}-auto-camera`,
			rig: rigs[index % rigs.length],
			type: 'camera'
		});
	}
	if (profile.ambientKind && !beats.some(beat => beat.type === 'audio')) {
		beats.push({
			duration,
			id: `${sceneId(scene, index)}-ambient`,
			kind: String(profile.ambientKind),
			type: 'audio',
			volume: finite(profile.ambientVolume, 0.22)
		});
	}
	return {
		...scene,
		beats,
		grade: scene.grade || profile.grade,
		transition: scene.transition || profile.transition || 'cut',
		world: scene.world || profile.world || null
	};
}

function sceneMarkers(scenes) {
	let cursor = 0;
	return scenes.map((scene, index) => {
		const time = Number.isFinite(Number(scene.start)) ? Number(scene.start) : cursor;
		cursor = Math.max(cursor, time + Number(scene.duration || 0));
		return {
			id: `agent-scene-marker-${index + 1}`,
			label: String(scene.label || sceneId(scene, index)),
			time
		};
	});
}

function sceneId(scene, index) {
	return String(scene.id || `scene-${index + 1}`);
}

function finite(value, fallback) {
	return Number.isFinite(Number(value)) ? Number(value) : fallback;
}

function array(value) {
	return Array.isArray(value) ? value : [];
}
