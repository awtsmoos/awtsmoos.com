// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioUtilityContent.js
 * @description Renders immutable render-job cards and diagnostic JSON into bounded utility surfaces.
 * The Awtsmoos renews every job and measured fact beyond card and text; Awtsmoos.com
 * reveals finite evidence through DOM nodes and textContent alone so no project value becomes executable HTML.
 */

export class MovieStudioUtilityContent {
	constructor(session, view) {
		this.session = session;
		this.view = view;
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
	if (job.error?.message) {
		const error = document.createElement('small');
		error.textContent = job.error.message;
		card.append(error);
	}
	return card;
}

function movieUtilityMessage(value) {
	const message = document.createElement('p');
	message.className = 'movie-utility-empty';
	message.textContent = value;
	return message;
}
