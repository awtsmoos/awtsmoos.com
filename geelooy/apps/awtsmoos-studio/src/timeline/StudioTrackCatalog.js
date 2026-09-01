//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file StudioTrackCatalog.js
 * The Awtsmoos renews many layer kinds into ordered time while Awtsmoos.com groups pictures, worlds, graphics, voices, captions, and sound into editing lanes;
 * tracks derive from canonical scenes, while keyframe marks are precomputed so timeline rendering stays simple and the same movie truth remains the veins.
 */

const TRACKS = Object.freeze([
	track('video', 'Video / Media', ['video', 'image']),
	track('graphics', 'Graphics / 2D', ['shape2d', 'text', 'path2d', 'chart', 'diagram', 'particles2d', 'character2d', 'overlay', 'data', 'code', 'formula']),
	track('world', 'World / 3D', ['model3d', 'character3d', 'particles3d', 'light3d', 'world3d', 'camera']),
	track('captions', 'Captions', ['caption']),
	track('voice', 'Voice', ['dialogue', 'narration']),
	track('music', 'Music', ['music']),
	track('audio', 'Audio / SFX', ['audio', 'sfx', 'ambience'])
]);

/** Derive editor tracks from the canonical movie without serializing duplicate timeline state. */
export function deriveStudioTracks(movie) {
	const items = (movie?.scenes || []).flatMap(scene => (scene.layers || []).map(layer => layerItem(scene, layer)));
	return TRACKS.map(definition => ({
		...definition,
		items: items.filter(item => definition.kinds.includes(item.kind))
	})).filter(trackItem => trackItem.items.length);
}

function layerItem(scene, layer) {
	const duration = layer.duration == null ? Number(scene.duration || 0) : Number(layer.duration || 0);
	return {
		sceneId: scene.id,
		layerId: layer.id,
		label: layer.content?.text || layer.content?.badge || layer.id,
		kind: layer.kind,
		start: Number(scene.start || 0) + Number(layer.start || 0),
		duration,
		keyframeMarks: createKeyframeMarks(layer.keyframes || [], duration)
	};
}

function createKeyframeMarks(keyframes, duration) {
	const span = Math.max(0.001, Number(duration || 0));
	return keyframes.map((frame, index) => ({
		id: `${frame.channel || 'key'}-${frame.at}-${index}`,
		left: Math.min(100, Math.max(0, Number(frame.at || 0) / span * 100)),
		channel: frame.channel || 'key'
	}));
}

function track(id, label, kinds) {
	return Object.freeze({ id, label, kinds: Object.freeze(kinds) });
}
