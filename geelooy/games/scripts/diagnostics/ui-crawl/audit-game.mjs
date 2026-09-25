// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos lets one world be examined without burdening its neighbors;
 * Awtsmoos.com tests each finite route against the surface covenant it actually promises.
 */
import {
	desktopViewport,
	mobileViewport,
	readinessTimeoutMs,
	settleDesktopMs,
	settlePrimaryMobileMs
} from './config.mjs';
import {
	classifyAudit,
	decorateMobileMetrics,
	desktopExpression,
	mobileExpression
} from './metrics.mjs';
import { routePolicyFor } from './route-policy.mjs';
import { mobileSurfaceExpression } from './surface-metrics.mjs';
import { auditSupplementalViewports } from './viewport-suite.mjs';

export async function auditGame(client, origin, slug) {
	const policy = routePolicyFor(slug);
	const record = createRecord(slug, policy);
	client.setEventSink(message => captureEvent(record, message));
	await prepareDesktop(client);
	await client.send('Page.navigate', { url: `${origin}/games/${encodeURIComponent(slug)}/?uiCrawl=1` });
	record.ready = await client.waitFor(policy.readyExpression, readinessTimeoutMs);
	await sleep(settleDesktopMs);
	record.desktop = await client.evaluate(desktopExpression);
	if (policy.shellRequired) {
		record.ready = record.ready || record.desktop.shellCount === 1;
	} else {
		record.ready = record.ready || record.desktop.readyState === 'complete';
	}
	await prepareMobile(client);
	await sleep(settlePrimaryMobileMs);
	record.mobile = decorateMobileMetrics(await client.evaluate(mobileExpression));
	record.mobile.surface = await client.evaluate(mobileSurfaceExpression);
	record.viewports = await auditSupplementalViewports(client);
	finalizeRecord(record);
	client.setEventSink(null);
	return record;
}

async function prepareDesktop(client) {
	await client.send('Emulation.setDeviceMetricsOverride', desktopViewport);
	await client.send('Emulation.setTouchEmulationEnabled', { enabled: false });
}

async function prepareMobile(client) {
	await client.send('Emulation.setDeviceMetricsOverride', mobileViewport);
	await client.send('Emulation.setTouchEmulationEnabled', { enabled: true, maxTouchPoints: 5 });
}

function createRecord(slug, policy) {
	return {
		slug,
		routeRole: policy.role,
		shellRequired: policy.shellRequired,
		ready: false,
		desktop: {},
		mobile: {},
		viewports: {},
		exceptions: [],
		networkFailures: [],
		badResponses: [],
		issues: []
	};
}

function captureEvent(record, message) {
	if (message.method === 'Runtime.exceptionThrown') record.exceptions.push(formatException(message.params?.exceptionDetails || {}));
	if (message.method === 'Network.loadingFailed') {
		const errorText = message.params?.errorText || '';
		if (errorText !== 'net::ERR_ABORTED') record.networkFailures.push(errorText || 'network failure');
	}
	if (message.method === 'Network.responseReceived') {
		const status = Number(message.params?.response?.status || 0);
		if (status >= 400) record.badResponses.push({ status, url: message.params?.response?.url || '' });
	}
}

function formatException(details) {
	return {
		text: details.text || '',
		description: details.exception?.description || '',
		url: details.url || '',
		lineNumber: details.lineNumber ?? null,
		columnNumber: details.columnNumber ?? null,
		stack: (details.stackTrace?.callFrames || []).map(frame => ({
			functionName: frame.functionName || '',
			url: frame.url || '',
			lineNumber: frame.lineNumber ?? null,
			columnNumber: frame.columnNumber ?? null
		}))
	};
}

function finalizeRecord(record) {
	record.exceptions = unique(record.exceptions);
	record.networkFailures = unique(record.networkFailures);
	record.badResponses = unique(record.badResponses);
	record.issues = classifyAudit(record);
}

function unique(values) {
	const encoded = values.map(value => typeof value === 'string' ? value : JSON.stringify(value));
	return [...new Set(encoded)].map(value => {
		try { return JSON.parse(value); } catch { return value; }
	});
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}
