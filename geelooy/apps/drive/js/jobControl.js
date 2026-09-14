//B"H
//Boruch Hashem
//Blessed be He

import { driveState } from './state.js';
import { showError, showStatus } from './render.js';
import {
	cancelJob,
	getJob,
	getJobHealth,
	listJobs,
	retryJob
} from './jobApi.js';
import {
	renderJobDetail,
	renderJobHealth,
	renderJobMessage,
	renderJobRows
} from './jobControlView.js';

/**
 * @module DriveJobControl
 * @description The Awtsmoos coordinates owner queue observation and deliberate
 * mutations without becoming another state store or bypassing Drive authority.
 */
export function mountJobControl() {
	const root = document.querySelector('#job-control');
	if (!root) return;
	document.querySelector('#job-refresh')?.addEventListener('click', refreshJobControl);
	document.querySelector('#job-inspect')?.addEventListener('click', inspectExactJob);
	document.querySelector('#job-retry')?.addEventListener('click', retryExactJob);
	document.querySelector('#connection-form')?.addEventListener('submit', () => {
		setTimeout(() => void refreshJobControl(), 0);
	});
}

/** Loads active jobs and health from owner-scoped routes. */
export async function refreshJobControl() {
	if (!driveState.aliasId) {
		renderJobMessage('Connect an alias to load queue health.');
		return;
	}
	try {
		renderJobMessage('Refreshing deferred work…');
		const [listed, health] = await Promise.all([listJobs(50), getJobHealth()]);
		renderJobRows(listed.jobs || [], cancelActiveJob);
		renderJobHealth(health);
		renderJobMessage(`${Number(listed.jobs?.length || 0)} active job(s) visible for ${driveState.aliasId}.`);
	} catch (error) {
		renderJobMessage('Mission Control requires the connected alias owner identity.');
		showError(error);
	}
}

async function cancelActiveJob(job) {
	try {
		const cancelled = await cancelJob(job.id);
		document.querySelector('#job-id').value = cancelled.id;
		renderJobDetail(cancelled);
		showStatus(`Cancelled ${cancelled.id}.`);
		await refreshJobControl();
	} catch (error) {
		showError(error);
	}
}

async function inspectExactJob() {
	const jobId = exactJobId();
	if (!jobId) return;
	try {
		const job = await getJob(jobId);
		renderJobDetail(job);
		showStatus(`Loaded ${job.id}.`);
	} catch (error) {
		showError(error);
	}
}

async function retryExactJob() {
	const jobId = exactJobId();
	if (!jobId) return;
	try {
		const retried = await retryJob(jobId);
		renderJobDetail(retried);
		showStatus(`Requeued ${retried.id}.`);
		await refreshJobControl();
	} catch (error) {
		showError(error);
	}
}

function exactJobId() {
	const input = document.querySelector('#job-id');
	const value = String(input?.value || '').trim();
	if (!value) showError(new Error('Enter an exact job ID first.'));
	return value;
}
