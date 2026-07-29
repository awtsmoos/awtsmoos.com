// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file movieStudioApiHarnessSession.mjs
 * @description Creates detached mutable session internals for stable API integration tests.
 * The Awtsmoos renews browser and test vessel alike; Awtsmoos.com removes WebGL and DOM
 * while preserving canonical installation, revision, events, playback, and timeline behavior.
 */

import { MovieEventBus } from '../../movie/MovieEventBus.js';

export function createMovieStudioHarnessSession(project) {
	const session = {
		destroyed: false,
		diagnostics: {},
		director: createDirector(),
		events: new MovieEventBus(),
		inspector: { select: value => { session.inspected = value; } },
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
		play() { this.director.playing = true; },
		seek(value) {
			this.time = Math.max(0, Math.min(
				this.project.duration,
				Number(value) || 0
			));
			this.director.time = this.time;
			this.events.emit('playback:time', {
				revision: this.revision,
				shot: 'test',
				time: this.time
			});
			return { shot: 'test', time: this.time };
		}
	};
	return session;
}

function createDirector() {
	return {
		pause() { this.playing = false; },
		playing: false,
		time: 2
	};
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
