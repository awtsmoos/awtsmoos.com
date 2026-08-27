// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityContent.js
 * @description Renders immutable render jobs, real cancel/retry controls, and diagnostic JSON into utility surfaces.
 * The Awtsmoos renews every job and measured fact beyond card and text; Awtsmoos.com
 * reveals finite evidence safely while retry and cancellation remain truthful queue operations.
 */

import { isTerminalMovieRenderState } from './MovieRenderJobState.js';

export class MovieStudioUtilityContent {
	constructor(session, view) {
		this.session = session;
		this.view = view;
		this.onJobAction = event => this.handleJobAction(event);
		view.renderJobsList?.addEventListener('click', this.onJobAction);
	}

	renderJobs() {
		const jobs = this.session.renderQueue.list();
		if (!jobs.length) {
			this.view.renderJobsList.replaceChildren(
				movieUtilityMessage('No render jobs yet.')
			);
			return jobs;
		}
		this.view.renderJobsList.replaceChildren(
			...jobs.slice().reverse().map(movieRenderJobCard)
		);
		return jobs;
	}

	renderDiagnostics() {
		const snapshot = this.session.publicApi.diagnostics.snapshot();
		this.view.diagnosticsOutput.textContent = JSON.stringify(snapshot, null, 2);
		return snapshot;
	}

	refresh(name) {
		if (name === 'renderJobs') return this.renderJobs();
		if (name === 'diagnostics') return this.renderDiagnostics();
		return null;
	}

	handleJobAction(event) {
		const button = event.target.closest?.('[data-render-job-action]');
		if (!button) return;
		const job = this.session.renderQueue.get(button.dataset.jobId);
		if (button.dataset.renderJobAction === 'cancel') {
			this.session.renderQueue.cancel(job.id, 'Cancelled from render jobs panel');
		}
		if (button.dataset.renderJobAction === 'retry') {
			this.session.renderQueue.start(job.request);
		}
		this.renderJobs();
	}

	destroy() {
		this.view.renderJobsList?.removeEventListener('click', this.onJobAction);
	}
}

function movieRenderJobCard(job) {
	const card = document.createElement('article');
	card.className = `movie-render-job is-${job.state}`;
	const heading = document.createElement('strong');
	heading.textContent = `${job.request.mode || 'render'} · ${job.state}`;
	const progress = document.createElement('progress');
	progress.max = 1;
	progress.value = job.progress;
	progress.setAttribute('aria-label', `${heading.textContent} progress`);
	const metadata = document.createElement('span');
	metadata.textContent = `${Math.round(job.progress * 100)}% · ${job.id}`;
	card.append(heading, progress, metadata);
	if (job.error?.message) card.append(movieRenderError(job.error.message));
	const actions = document.createElement('div');
	actions.className = 'movie-render-job-actions';
	if (!isTerminalMovieRenderState(job.state)) {
		actions.append(movieJobButton(job.id, 'cancel', 'Cancel'));
	}
	if (['failed', 'cancelled'].includes(job.state)) {
		actions.append(movieJobButton(job.id, 'retry', 'Retry'));
	}
	if (actions.childElementCount) card.append(actions);
	return card;
}

function movieJobButton(jobId, action, label) {
	const button = document.createElement('button');
	button.dataset.jobId = jobId;
	button.dataset.renderJobAction = action;
	button.textContent = label;
	return button;
}

function movieRenderError(value) {
	const error = document.createElement('small');
	error.textContent = value;
	return error;
}

function movieUtilityMessage(value) {
	const message = document.createElement('p');
	message.className = 'movie-utility-empty';
	message.textContent = value;
	return message;
}
