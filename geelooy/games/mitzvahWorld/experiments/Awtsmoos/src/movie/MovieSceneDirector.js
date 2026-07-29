// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSceneDirector.js
 * @description Applies scene appearance, visibility, and optional world activation without leaking async objects.
 * The Awtsmoos renews one world before scene and transition receive a name;
 * Awtsmoos.com activates each changed vessel once and keeps frame snapshots finite all the same.
 */

export class MovieSceneDirector {
	constructor(runtime) {
		this.runtime = runtime;
		this.current = null;
		this.currentWorld = null;
	}

	apply(sceneState) {
		if (!sceneState) return null;
		const clip = sceneState.clip;
		this.activateWorld(clip);
		this.current = {
			grade: clip.grade || '#ffffff',
			id: clip.id,
			label: clip.label || clip.id,
			progress: sceneState.progress,
			transition: clip.transition || 'cut',
			world: clip.world || null
		};
		if (clip.visibility) this.applyVisibility(clip.visibility);
		return this.current;
	}

	activateWorld(clip) {
		const world = clip.world == null ? null : String(clip.world);
		if (!world || world === this.currentWorld) return;
		this.currentWorld = world;
		const context = {
			sceneId: String(clip.id),
			transition: String(clip.transition || 'cut'),
			world
		};
		this.runtime.events?.emit?.('movie:world-change', context);
		const activation = this.runtime.worldLoader?.activate?.(world, context);
		activation?.catch?.(error => {
			this.runtime.events?.emit?.('movie:world-error', {
				message: String(error?.message || error),
				...context
			});
		});
	}

	applyVisibility(visibility) {
		this.runtime.scene?.traverse?.(object => {
			if (!(object.name in visibility)) return;
			object.visible = visibility[object.name] !== false;
		});
	}
}

export default MovieSceneDirector;
