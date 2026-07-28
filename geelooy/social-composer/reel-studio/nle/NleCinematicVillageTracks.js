// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleCinematicVillageTracks
 * @description
 * One village journey becomes renderable NLE visuals and canonical scene, actor,
 * camera, dialogue, and audio tracks for the complete MitzvahWorld handoff.
 */

export function createCinematicVillageTracks(duration = 24) {
	return [
		{ clips: [{ assetId: 'tone-village-score', duration, id: 'village-score', label: 'Village score', start: 0 }], id: 'nle-audio', type: 'nle-audio' },
		{ clips: titleClips(), id: 'nle-overlay', type: 'nle-overlay' },
		{ clips: [{ assetId: 'cinematic-village-world', duration, id: 'village-world-clip', label: 'Living village world', start: 0 }], id: 'nle-visual', type: 'nle-visual' },
		{ clips: sceneClips(), id: 'scene', type: 'scene' },
		{ clips: actorClips(), id: 'hero-performance', target: 'player', type: 'actor' },
		{ clips: cameraClips(), id: 'camera-cuts', type: 'camera' },
		{ clips: dialogueClips(), id: 'dialogue', type: 'dialogue' },
		{ clips: audioClips(), id: 'audio', type: 'audio' }
	];
}

function sceneClips() {
	return [
		clip('village-awakens', 0, 6, { grade: '#324a68', label: 'Village awakens', transition: 'fade' }),
		clip('road-through-houses', 6, 7, { grade: '#8b6a48', label: 'Road through houses', transition: 'crossfade' }),
		clip('forest-edge', 13, 6, { grade: '#39533d', label: 'Forest edge', transition: 'crossfade' }),
		clip('radiant-home', 19, 5, { grade: '#c28a43', label: 'Radiant home', transition: 'crossfade' })
	];
}

function actorClips() {
	return [
		clip('hero-enters-village', 0, 8, { action: 'move', animation: 'walk', from: { x: -38, z: 26 }, to: { x: -12, z: 8 }, easing: 'smootherstep' }),
		clip('hero-crosses-market', 8, 7, { action: 'move', animation: 'walk', from: { x: -12, z: 8 }, to: { x: 6, z: -5 }, easing: 'easeInOutCubic' }),
		clip('hero-pauses', 15, 2, { action: 'pose', animation: 'idle', at: { x: 6, z: -5 } }),
		clip('hero-reaches-home', 17, 7, { action: 'move', animation: 'walk', from: { x: 6, z: -5 }, to: { x: 23, z: -18 }, easing: 'smootherstep' })
	];
}

function cameraClips() {
	return [
		clip('aerial-village', 0, 4, { anchor: { x: -15, y: 0, z: 8 }, rig: 'aerialPullback', shot: 'Aerial village reveal' }),
		clip('road-dolly', 4, 5, { anchor: { x: -24, y: 0, z: 16 }, rig: 'dollyIn', targetActor: 'player' }),
		clip('market-side-track', 9, 4, { anchor: { x: -4, y: 0, z: 2 }, rig: 'sideTrack', targetActor: 'player' }),
		clip('forest-orbit', 13, 5, { anchor: { x: 8, y: 0, z: -8 }, rig: 'orbitLeft', targetActor: 'player' }),
		clip('home-crane', 18, 6, { anchor: { x: 22, y: 0, z: -18 }, rig: 'craneReveal', targetActor: 'player' })
	];
}

function titleClips() {
	return [
		{ assetId: 'title-village-opening', duration: 3.5, id: 'village-opening-title', label: 'Opening title', start: 0.5 },
		{ assetId: 'title-village-closing', duration: 4, id: 'village-closing-title', label: 'Closing title', start: 20 }
	];
}

function dialogueClips() {
	return [
		clip('narrator-village', 5, 3, { speaker: 'Narrator', text: 'The road remembers every footstep that carried light home.' }),
		clip('hero-village-line', 19.2, 3.4, { speaker: 'Chossid', text: 'A whole village can awaken from one faithful step.' })
	];
}

function audioClips() {
	return [
		clip('dawn-air', 0, 8, { frequency: 82, kind: 'score', volume: 0.025 }),
		clip('market-warmth', 7, 9, { frequency: 123, kind: 'score', volume: 0.035 }),
		clip('home-reveal-tone', 17, 7, { frequency: 174, kind: 'score', volume: 0.05 })
	];
}

function clip(id, start, duration, value) {
	return { duration, easing: value.easing || 'linear', id, start, ...value };
}
