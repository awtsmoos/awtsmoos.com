// B"H
/**
 * @file MovieSceneDirector.js
 * @description Applies scene labels, grading, and optional object visibility maps.
 */
export class MovieSceneDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.current = null;
	}

	apply(sceneState) {
		if (!sceneState) return null;
		const clip = sceneState.clip;
		this.current = {
			id: clip.id,
			label: clip.label || clip.id,
			grade: clip.grade || '#ffffff',
			transition: clip.transition || 'cut',
			progress: sceneState.progress
		};
		if (clip.visibility) this.applyVisibility(clip.visibility);
		return this.current;
	}

	applyVisibility(visibility) {
		this.runtime.scene.traverse((object) => {
			if (!(object.name in visibility)) return;
			object.visible = visibility[object.name] !== false;
		});
	}
}

export default MovieSceneDirector;
