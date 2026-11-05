// B"H
// Boruch Hashem
// Blessed is He

/** Owns timing, canonical cast, Short real-world systems, media, cameras, playback, and seek. */
import { MovieActorDirector } from './MovieActorDirector.js';
import { MovieAuthoring3dDirector } from './MovieAuthoring3dDirector.js';
import { MovieCameraDirector } from './MovieCameraDirector.js';
import { assertMovieCinemaHumans } from './MovieCinemaHumanSafety.js';
import { MovieCrowdDirector } from './MovieCrowdDirector.js';
import { applyMovieDirectorFrame } from './MovieDirectorFrame.js';
import { MovieDoorDirector } from './MovieDoorDirector.js';
import { MovieOverlay } from './MovieOverlay.js';
import { createMoviePlaybackClock } from './MoviePlaybackClock.js';
import { normalizeMoviePlaybackRate } from './MoviePlaybackRate.js';
import { MoviePerformanceDirector } from './MoviePerformanceDirector.js';
import { MovieSceneDirector } from './MovieSceneDirector.js';
import { MovieShortHeroWorldDirector } from './shorts/MovieShortHeroWorldDirector.js';
import { MovieTimeline } from './MovieTimeline.js';
import { MovieVisualEffectDirector } from './MovieVisualEffectDirector.js';

export class MovieDirector {
	constructor(runtime, project) {
		assertProductionHumanManifest(project);
		this.runtime = runtime;
		this.project = project;
		this.timeline = new MovieTimeline(project);
		this.actors = new MovieActorDirector(runtime);
		this.authoring3d = new MovieAuthoring3dDirector(runtime, project.authoring3d);
		this.crowd = new MovieCrowdDirector(runtime, project.characters || []);
		this.cameras = new MovieCameraDirector(runtime, project);
		this.doors = new MovieDoorDirector(runtime);
		this.scenes = new MovieSceneDirector(runtime);
		this.shortWorld = new MovieShortHeroWorldDirector(runtime, project);
		this.visuals = new MovieVisualEffectDirector(runtime);
		this.performance = new MoviePerformanceDirector(runtime, project);
		this.overlay = new MovieOverlay(project);
		this.time = 0;
		this.playbackRate = 0;
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

	async prepareExactFrame(time) {
		await Promise.all([this.overlay.prepareMedia(time), this.shortWorld.prepare?.()]);
	}

	seek(time, deltaTime = 1 / this.project.fps) {
		this.time = Math.max(0, Math.min(this.project.duration, Number(time) || 0));
		this.lastFrame = applyMovieDirectorFrame(this, this.time, Math.abs(deltaTime));
		return this.lastFrame;
	}

	play(options = {}) {
		this.pause();
		const rate = normalizeMoviePlaybackRate(options.rate, 1);
		if (!rate) return this;
		const startAt = options.startAt ?? this.time;
		this.playbackRate = rate;
		this.playing = true;
		this.overlay.playMedia(startAt, rate);
		const clock = createMoviePlaybackClock({
			duration: this.project.duration,
			now: performance.now(),
			rate,
			startAt
		});
		this.animationFrame = requestAnimationFrame(now => this.playbackFrame(clock, now, options));
		return this;
	}

	playbackFrame(clock, now, options) {
		if (!this.playing) return;
		const sample = clock.sample(now);
		const state = this.seek(sample.time, sample.delta);
		options.onFrame?.(state);
		if (sample.atBoundary) {
			this.pause();
			options.onEnd?.(state);
			return;
		}
		this.animationFrame = requestAnimationFrame(time => this.playbackFrame(clock, time, options));
	}

	pause() {
		this.playing = false;
		this.playbackRate = 0;
		this.overlay?.pauseMedia();
		if (this.animationFrame) cancelAnimationFrame(this.animationFrame);
		this.animationFrame = 0;
		return this;
	}

	destroy() {
		this.pause();
		this.performance.destroy();
		this.visuals.destroy();
		this.shortWorld.destroy();
		this.authoring3d.destroy();
		this.crowd.destroy();
		this.overlay.destroy();
	}
}

function assertProductionHumanManifest(project) {
	if (project?.metadata?.shortId) assertMovieCinemaHumans(project, { finalMode: true });
}

export default MovieDirector;
