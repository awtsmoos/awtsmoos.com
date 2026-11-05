// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MovieStudioMediaJobExecutors.js
 * @description Registers cancellable availability and proxy-attachment media job executors.
 * The Awtsmoos renews every network witness before project status can change; Awtsmoos.com
 * validates first, cancels honestly, reports progress, and commits one reversible project act.
 */

import { runMovieMediaJobBatch, throwIfMovieMediaJobAborted } from './MovieMediaJobBatch.js';
import { probeMovieMediaUrl } from './MovieMediaJobUrl.js';
import { commitMovieMediaJobPatches } from './MovieStudioMediaJobProject.js';

export function registerMovieStudioMediaJobExecutors(session, options = {}) {
	session.renderQueue.registerExecutor('media-availability', context => (
		runAvailabilityJob(session, context, options)
	));
	session.renderQueue.registerExecutor('media-proxy-attach', context => (
		runProxyAttachJob(session, context, options)
	));
	return session.renderQueue;
}

export async function runAvailabilityJob(session, context, options = {}) {
	const targets = selectTargets(session.project.media, context.request.mediaId);
	const checkedAt = String(context.request.checkedAt || new Date().toISOString());
	const checks = await runMovieMediaJobBatch(targets, async item => {
		const source = await safeProbe(item.url, context.signal, options);
		const proxy = await safeProbe(item.proxyUrl, context.signal, options);
		return { mediaId: item.id, proxy, source };
	}, {
		concurrency: context.request.concurrency,
		onProgress: context.onProgress,
		signal: context.signal
	});
	throwIfMovieMediaJobAborted(context.signal);
	const patches = new Map(checks.map(check => [check.mediaId, {
		metadata: { availability: { checkedAt, proxy: check.proxy, source: check.source } },
		status: check.source.ok ? 'online' : 'offline'
	}]));
	commitMovieMediaJobPatches(session, patches, 'Validate movie media availability');
	return summarizeChecks(checks);
}

export async function runProxyAttachJob(session, context, options = {}) {
	const mediaId = String(context.request.mediaId || '');
	const item = (session.project.media || []).find(media => media.id === mediaId);
	if (!item) throw new Error(`Movie media ${mediaId || '(empty)'} was not found.`);
	context.onProgress(0.1);
	const validation = await probeMovieMediaUrl(context.request.proxyUrl, {
		baseUrl: options.baseUrl,
		fetchImpl: options.fetchImpl,
		signal: context.signal,
		timeoutMs: context.request.timeoutMs
	});
	if (!validation.ok) throw new Error(`Movie proxy validation failed (${validation.status || 'network failure'}).`);
	throwIfMovieMediaJobAborted(context.signal);
	const revision = Number(item.metadata?.proxyRevision || 0) + 1;
	commitMovieMediaJobPatches(session, new Map([[mediaId, {
		metadata: {
			proxyAttachedAt: String(context.request.checkedAt || new Date().toISOString()),
			proxyRevision: revision,
			proxyValidation: validation
		},
		proxyUrl: String(context.request.proxyUrl)
	}]]), 'Attach movie media proxy');
	context.onProgress(1);
	return { mediaId, proxyUrl: String(context.request.proxyUrl), revision, validation };
}

function selectTargets(media, mediaId) {
	if (!mediaId) return [...(media || [])];
	const target = (media || []).find(item => item.id === String(mediaId));
	if (!target) throw new Error(`Movie media ${mediaId} was not found.`);
	return [target];
}

async function safeProbe(url, signal, options) {
	if (!url) return { ok: false, status: 0, url: null };
	try {
		return await probeMovieMediaUrl(url, {
			baseUrl: options.baseUrl, fetchImpl: options.fetchImpl, signal
		});
	} catch (error) {
		if (signal?.aborted) throw error;
		return { error: error.message, ok: false, status: 0, url: String(url) };
	}
}

function summarizeChecks(checks) {
	return {
		checked: checks.length,
		checks,
		proxyReady: checks.filter(check => check.proxy.ok).length,
		sourceOnline: checks.filter(check => check.source.ok).length
	};
}
