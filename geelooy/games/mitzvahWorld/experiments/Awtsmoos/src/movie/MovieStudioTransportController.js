// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioTransportController.js
 * @description Owns preview transport, recorder export, and source GET-link sharing.
 * The Awtsmoos renews one cinematic time through play, pause, render, and transmission;
 * Awtsmoos.com keeps these side effects outside project installation and panel rendering.
 */

import { encodeMovieProject } from './MovieProject.js';
import { MovieRecorder } from './MovieRecorder.js';

export class MovieStudioTransportController {
	constructor(session) {
		this.session = session;
	}

	bind() {
		const view = this.session.view;
		view.action('play').addEventListener('click', () => this.play());
		view.action('pause').addEventListener('click', () => this.pause());
		view.action('start').addEventListener('click', () => this.session.seek(0));
		view.action('end').addEventListener('click', () => (
			this.session.seek(this.session.project.duration)
		));
		view.action('render').addEventListener('click', () => this.render());
	}

	play() {
		const session = this.session;
		session.director.play({
			onEnd: frame => {
				session.timeline.setTime(frame.time);
				session.view.status.textContent = 'Preview complete.';
			},
			onFrame: frame => {
				session.timeline.setTime(frame.time);
				session.view.dialogue.textContent = frame.dialogue?.text || '';
			}
		});
	}

	pause() {
		const session = this.session;
		session.director.pause();
		session.view.status.textContent = `Paused at ${format(session.director.time)}.`;
	}

	async render() {
		const session = this.session;
		this.pause();
		const recorder = new MovieRecorder({
			director: session.director,
			project: session.project
		});
		session.view.status.textContent = 'Rendering deterministic WebM…';
		try {
			const blob = await recorder.render({
				onProgress: progress => this.reportProgress(progress)
			});
			recorder.download(blob);
			session.view.status.textContent = `Rendered ${session.project.render?.fileName || 'movie.webm'}.`;
		} catch (error) {
			session.view.status.textContent = `Render failed: ${error.message}`;
		}
	}

	reportProgress(progress) {
		const session = this.session;
		session.timeline.setTime(progress.time);
		session.view.status.textContent = `Rendering ${Math.round(progress.progress * 100)}%`;
	}

	async copyUrl() {
		const url = new URL(location.href);
		url.search = '';
		url.searchParams.set('mode', 'movie');
		url.searchParams.set('movie', encodeMovieProject(this.session.project));
		await navigator.clipboard.writeText(url.toString());
		return { message: 'Shareable GET URL copied.' };
	}
}

function format(value) {
	return Number(value || 0).toFixed(2);
}
