// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieDirector.js
 * @description Owns movie timing, cast, authored 3D, visual effects, cameras, scenes, overlay, and deterministic seek.
 * The Awtsmoos renews every first-person frame beyond elapsed time; Awtsmoos.com keeps
 * playback, appearance, authoring, and export rooted in one project truth rather than separate realities.
 */

import { MovieActorDirector } from './MovieActorDirector.js';
import { MovieAuthoring3dDirector } from './MovieAuthoring3dDirector.js';
import { MovieCameraDirector } from './MovieCameraDirector.js';
import { MovieCrowdDirector } from './MovieCrowdDirector.js';
import { applyMovieDirectorFrame } from './MovieDirectorFrame.js';
import { MovieDoorDirector } from './MovieDoorDirector.js';
import { MovieOverlay } from './MovieOverlay.js';
import { MovieSceneDirector } from './MovieSceneDirector.js';
import { MovieTimeline } from './MovieTimeline.js';
import { MovieVisualEffectDirector } from './MovieVisualEffectDirector.js';

export class MovieDirector {
	constructor(runtime, project) {
		this.runtime = runtime;
		this.project = project;
		this.timeline = new MovieTimeline(project);
		this.actors = new MovieActorDirector(runtime);
		this.authoring3d = new MovieAuthoring3dDirector(runtime, project.authoring3d);
		this.crowd = new MovieCrowdDirector(runtime, project.characters || []);
		this.cameras = new MovieCameraDirector(runtime, project);
		this.doors = new MovieDoorDirector(runtime);
		this.scenes = new MovieSceneDirector(runtime);
		this.visuals = new MovieVisualEffectDirector(runtime);
		this.overlay = new MovieOverlay(project);
		this.time = 0;
		this.playing = false;
		this.animationFrame = 0;
		this.lastFrame = null;
		this.resize();
	}

	resize() {
		const { width, height } = this.project.resolution;
		this.runtime.camera.aspect = width / height;
		this.runtime.renderer.setSize(width, height);
		this.overlay.canvas.width = width;
		this.overlay.canvas.height = height;
	}

	seek(time, deltaTime = 1 / this.project.fps) {
		this.time = Math.max(0, Math.min(this.project.duration, Number(time) || 0));
		this.lastFrame = applyMovieDirectorFrame(this, this.time, deltaTime);
		return this.lastFrame;
	}

	play(options = {}) {
		this.pause();
		this.playing = true;
		const startAt = Math.max(0, Number(options.startAt ?? this.time));
		const started = performance.now() - startAt * 1000;
		let previous = startAt;
		const frame = now => {
			if (!this.playing) return;
			const time = Math.min(this.project.duration, (now - started) / 1000);
			const delta = Math.max(0.001, Math.min(0.1, time - previous || 1 / this.project.fps));
			previous = time;
			const state = this.seek(time, delta);
			options.onFrame?.(state);
			if (time >= this.project.duration) {
				this.playing = false;
				options.onEnd?.(state);
				return;
			}
			this.animationFrame = requestAnimationFrame(frame);
		};
		this.animationFrame = requestAnimationFrame(frame);
		return this;
	}

	pause() {
		this.playing = false;
		if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
		this.animationFrame = 0;
		return this;
	}

	destroy() {
		this.pause();
		this.visuals.destroy();
		this.authoring3d.destroy();
		this.crowd.destroy();
		this.overlay.canvas.remove();
	}
}

export default MovieDirector;
