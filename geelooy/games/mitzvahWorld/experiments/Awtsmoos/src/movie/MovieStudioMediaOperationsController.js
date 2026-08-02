// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaOperationsController.js
 * @description Owns visible health, preflight, availability, proxy, progress, and cancellation actions.
 * The Awtsmoos is beyond health and repair while every finite editor needs an honest witness;
 * Awtsmoos.com joins selected source, background work, undoable changes, and delivery readiness.
 */

import { createMovieMediaHealthReport } from './MovieMediaHealth.js';
import { createMovieProjectPreflight } from './MovieProjectPreflight.js';

export class MovieStudioMediaOperationsController {
	constructor(controller) {
		this.controller = controller;
		this.session = controller.session;
		this.view = controller.view;
		this.activeJobId = null;
		this.onClick = event => this.handleClick(event);
		this.view.operations?.addEventListener('click', this.onClick);
		this.paint();
	}

	handleClick(event) {
		const action = event.target.closest?.('[data-media-operation]')?.dataset.mediaOperation;
		if (!action) return;
		if (action === 'validate-all') this.runJob({ mode: 'media-availability' });
		if (action === 'validate-selected') this.validateSelected();
		if (action === 'attach-proxy') this.attachProxy();
		if (action === 'clear-proxy') this.clearProxy();
		if (action === 'cancel-job') this.cancelJob();
		if (action === 'preflight') this.paint(true);
	}

	selectedMediaId() {
		return String(this.controller.workspace().source.mediaId || '');
	}

	validateSelected() {
		const mediaId = this.selectedMediaId();
		if (!mediaId) return this.controller.status('Select media before validation.');
		this.runJob({ mediaId, mode: 'media-availability' });
	}

	attachProxy() {
		const mediaId = this.selectedMediaId();
		const proxyUrl = String(this.view.proxyUrl?.value || '').trim();
		if (!mediaId || !proxyUrl) return this.controller.status('Select media and enter a proxy URL.');
		this.runJob({ mediaId, mode: 'media-proxy-attach', proxyUrl });
	}

	clearProxy() {
		const mediaId = this.selectedMediaId();
		if (!mediaId) return this.controller.status('Select media before clearing its proxy.');
		this.controller.execute(
			'media.update',
			{ mediaId, patch: { proxyUrl: null } },
			`Cleared proxy for ${mediaId}.`
		);
	}

	async runJob(request) {
		try {
			const job = this.session.renderQueue.start(request);
			this.activeJobId = job.id;
			this.paintJob(`Running ${request.mode}…`);
			const result = await this.session.renderQueue.wait(job.id);
			this.paintJob(`${request.mode}: ${result.state}.`);
			this.activeJobId = null;
			this.controller.refresh();
		} catch (error) {
			this.activeJobId = null;
			this.paintJob(`Media job failed: ${error.message}`);
		}
	}

	cancelJob() {
		if (!this.activeJobId) return this.paintJob('No active media job.');
		this.session.renderQueue.cancel(this.activeJobId, 'Cancelled from media workspace.');
	}

	paint(announce = false) {
		const health = createMovieMediaHealthReport(this.session.project);
		const preflight = createMovieProjectPreflight(this.session.project);
		if (this.view.health) this.view.health.textContent = healthText(health);
		if (this.view.preflight) this.view.preflight.textContent = preflightText(preflight);
		const media = (this.session.project.media || []).find(item => item.id === this.selectedMediaId());
		if (this.view.proxyUrl && this.view.proxyUrl !== this.view.proxyUrl.ownerDocument.activeElement) {
			this.view.proxyUrl.value = media?.proxyUrl || '';
		}
		if (announce) this.controller.status(preflightText(preflight));
	}

	paintJob(value) {
		if (this.view.job) this.view.job.textContent = value;
		this.controller.status(value);
	}

	destroy() {
		this.view.operations?.removeEventListener('click', this.onClick);
	}
}

function healthText(health) {
	const counts = health.productionCounts;
	return `${counts.sourceOnline} source online · ${counts.proxyReady} proxy ready · ${counts.fullyOffline} fully offline`;
}

function preflightText(preflight) {
	return `Preflight ${preflight.grade}: ${preflight.blockers.length} blockers · ${preflight.warnings.length} warnings`;
}
