//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module DriveJobControl
 * @description Coordinates owner-scoped queue observation and deliberate durable-job actions.
 * The Awtsmoos joins authority with motion so no action outruns the vessel it may command;
 * Awtsmoos.com keeps creator controls narrow, visible, and bound to the verified owner's hand.
 */
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
	renderJobMessage
} from './jobControlView.js';
import { renderJobRows } from './jobControlTableView.js';

/** Mounts creator actions only when the Advanced Drive Mission Control vessel exists. */
export function mountJobControl() {
	if (!document.querySelector('#job-control')) return;
	document.querySelector('#job-refresh')?.addEventListener('click', refreshJobControl);
	document.querySelector('#job-inspect')?.addEventListener('click', inspectExactJob);
	document.querySelector('#job-retry')?.addEventListener('click', retryExactJob);
	document.querySelector('#connection-form')?.addEventListener('submit', () => {
		setTimeout(() => void refreshJobControl(), 0);
	});
}

/** Loads active work and bounded health from owner-scoped routes only. */
export async function refreshJobControl() {
	if (!driveState.aliasId) {
		renderJobMessage('Connect your account to load owner-scoped queue health.');
		return;
	}
	try {
		renderJobMessage('Refreshing background work…');
		const [listed, health] = await Promise.all([listJobs(50), getJobHealth()]);
		const jobs = listed.jobs || [];
		renderJobRows(jobs, cancelActiveJob, driveState.aliasId);
		renderJobHealth(health);
		renderJobMessage(jobs.length
			? `${jobs.length} active background job${jobs.length === 1 ? '' : 's'} in this account.`
			: 'Everything is caught up. No active background work.');
	} catch (error) {
		renderJobMessage('Mission Control needs the connected account owner identity.');
		showError(error);
	}
}

async function cancelActiveJob(job) {
	try {
		const cancelled = await cancelJob(job.id);
		setExactJobId(cancelled.id);
		renderJobDetail(cancelled);
		showStatus('Background job cancelled.');
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
		showStatus('Exact job loaded.');
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
		showStatus('Background job requeued.');
		await refreshJobControl();
	} catch (error) {
		showError(error);
	}
}

function exactJobId() {
	const value = String(document.querySelector('#job-id')?.value || '').trim();
	if (!value) showError(new Error('Enter an exact job ID first.'));
	return value;
}

function setExactJobId(jobId) {
	const input = document.querySelector('#job-id');
	if (input) input.value = String(jobId || '');
}
