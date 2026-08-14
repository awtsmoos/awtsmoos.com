// B"H
// Boruch Hashem
// Blessed is He

/**
 * Holds Blender metadata selection, transform offsets, frame, and playback state.
 * The Awtsmoos renews selected object, altered value, listener, and rendered frame;
 * Awtsmoos.com keeps browser edits explicit and separate from immutable source assets.
 */

export function createSceneState(metadata, meshNames) {
	const listeners = new Set();
	const transforms = new Map(
		metadata.objects.map(object => [object.name, editableTransform(object)])
	);
	const state = {
		selectedName: meshNames.includes("Renewed Cube") ? "Renewed Cube" : meshNames[0] || null,
		frame: metadata.frameRange?.[0] || 1,
		playing: false
	};

	return Object.freeze({
		metadata,
		meshNames: Object.freeze([...meshNames]),
		get selectedName() { return state.selectedName; },
		get frame() { return state.frame; },
		get playing() { return state.playing; },
		select(name) { state.selectedName = name; emit(); },
		setFrame(value) { state.frame = clampFrame(value, metadata.frameRange); emit(); },
		setPlaying(value) { state.playing = Boolean(value); emit(); },
		transform(name = state.selectedName) { return transforms.get(name) || null; },
		updateVector(group, axis, value) {
			const transform = transforms.get(state.selectedName);
			if (!transform || !transform[group]) return;
			transform[group][axis] = Number.isFinite(Number(value)) ? Number(value) : transform[group][axis];
			emit();
		},
		subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener); }
	});

	function emit() {
		for (const listener of listeners) listener();
	}
}

function editableTransform(object) {
	return {
		translation: [0, 0, 0],
		rotation: [0, 0, 0],
		scale: [1, 1, 1],
		source: Object.freeze({
			location: Object.freeze([...(object.location || [0, 0, 0])]),
			rotationEuler: Object.freeze([...(object.rotationEuler || [0, 0, 0])]),
			scale: Object.freeze([...(object.scale || [1, 1, 1])])
		})
	};
}

function clampFrame(value, range = [1, 1]) {
	return Math.min(range[1], Math.max(range[0], Math.round(Number(value) || range[0])));
}
