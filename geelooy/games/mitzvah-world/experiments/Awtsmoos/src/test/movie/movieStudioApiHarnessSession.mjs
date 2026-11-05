// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiHarnessSession.mjs
 * @description Creates detached mutable session internals with professional transport semantics.
 * The Awtsmoos renews browser and test vessel alike; Awtsmoos.com removes WebGL and DOM
 * while preserving project installation, revision, events, rates, shuttle, frame-step, and timeline.
 */

import { MovieEventBus } from '../../movie/MovieEventBus.js';
import { nextMovieShuttleRate, stepMoviePlaybackTime } from '../../movie/MoviePlaybackRate.js';

export function createMovieStudioHarnessSession(project) {
	const session = {
		destroyed: false,
		diagnostics: {},
		director: createDirector(),
		events: new MovieEventBus(),
		inspector: { select: value => { session.inspected = value; } },
		playbackRate: 0,
		project: structuredClone(project),
		recorder: {},
		revision: 1,
		runtime: { renderer: { canvas: {}, stats: { frames: 1 } } },
		time: 2,
		timeline: createTimeline(),
		view: { status: { textContent: '' } },
		installProject(next, options = {}) {
			const previousRevision = this.revision;
			this.project = structuredClone(next);
			this.revision += 1;
			this.commands.restoreSelection(this.project, options.selection);
			this.events.emit('project:changed', {
				previousRevision,
				reason: options.reason || 'Test installation',
				revision: this.revision,
				title: this.project.title
			});
			return this.project;
		},
		pause() {
			this.director.playing = false;
			this.playbackRate = 0;
			return this.playbackState();
		},
		play(options = {}) {
			this.playbackRate = Number(options.rate ?? (this.playbackRate || 1));
			this.director.playing = Boolean(this.playbackRate);
			return this.playbackState();
		},
		playbackState() {
			return { playing: this.director.playing, rate: this.playbackRate, time: this.time };
		},
		seek(value) {
			this.time = Math.max(0, Math.min(this.project.duration, Number(value) || 0));
			this.director.time = this.time;
			this.events.emit('playback:time', {
				revision: this.revision,
				shot: 'test',
				time: this.time
			});
			return { shot: 'test', time: this.time };
		},
		setPlaybackRate(rate) {
			return Number(rate) ? this.play({ rate }) : this.pause();
		},
		shuttle(direction) {
			return this.play({ rate: nextMovieShuttleRate(this.playbackRate, direction) });
		},
		stepFrames(frames = 1) {
			this.pause();
			this.seek(stepMoviePlaybackTime(
				this.time, frames, this.project.fps, this.project.duration
			));
			return this.playbackState();
		},
		stop() {
			this.pause();
			this.seek(0);
			return this.playbackState();
		}
	};
	return session;
}

function createDirector() {
	return { pause() { this.playing = false; }, playing: false, time: 2 };
}

function createTimeline() {
	return {
		fit() { this.scale = 50; },
		scale: 34,
		setScale(value) { this.scale = Number(value); },
		snapping: true,
		updateCommands() {}
	};
}
