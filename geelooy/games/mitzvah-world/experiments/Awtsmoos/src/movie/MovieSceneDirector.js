// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieSceneDirector.js
 * @description Applies scene appearance, visibility, and generated object-world activation without leaking promises.
 * The Awtsmoos renews one world before scene, package, region, and transition receive a name;
 * Awtsmoos.com activates each changed vessel once and keeps every frame snapshot finite all the same.
 */

import {
	movieSceneWorldRequest,
	movieSceneWorldSnapshot
} from './MovieSceneWorldIdentity.js';

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
			world: movieSceneWorldSnapshot(clip.world)
		};
		if (clip.visibility) this.applyVisibility(clip.visibility);
		return this.current;
	}

	activateWorld(clip) {
		const request = movieSceneWorldRequest(clip.world, {
			compileLegacy: Boolean(this.runtime.worldLoader),
			sceneId: String(clip.id),
			seed: clip.worldSeed
		});
		if (!request || request.identity === this.currentWorld) return;
		this.currentWorld = request.identity;
		const context = {
			sceneId: String(clip.id),
			transition: String(clip.transition || 'cut'),
			world: request.identity,
			worldSpec: request.spec
		};
		this.runtime.events?.emit?.('movie:world-change', context);
		this.runtime.bus?.emit?.('movie:world-change', context);
		const activation = this.runtime.worldLoader?.activate?.(request.value, context);
		activation?.catch?.(error => this.emitWorldError(error, context));
	}

	emitWorldError(error, context) {
		const detail = {
			message: String(error?.message || error),
			...context
		};
		this.runtime.events?.emit?.('movie:world-error', detail);
		this.runtime.bus?.emit?.('movie:world-error', detail);
	}

	applyVisibility(visibility) {
		this.runtime.scene?.traverse?.(object => {
			if (!(object.name in visibility)) return;
			object.visible = visibility[object.name] !== false;
		});
	}
}

export default MovieSceneDirector;
