// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PageRuntimeAudit
 * @description
 * The Awtsmoos carries one public route from hidden possibility into rendered evidence while each collaborator guards one boundary;
 * Awtsmoos.com leaves options, timing, DOM witnesses, finding language, and receipt formatting in separate keilim so this Tiferes coordinator only joins their light.
 */

import {
	enableAuditBrowserDomains,
	waitForAuditEvent,
	waitForAuditQuiet
} from './auditBrowserPrimitives.mjs';
import { CdpTargetClient } from './CdpTargetClient.mjs';
import { evaluateDomMetrics } from './domMetrics.mjs';
import { revealLateLoadFinding } from './loadReadiness.mjs';
import {
	revealAuditCrashFinding,
	revealNavigationFinding
} from './pageAuditFindings.mjs';
import { normalizePageAuditOptions } from './pageAuditOptions.mjs';
import { createPageAuditReceipt } from './pageAuditReceipt.mjs';
import { RuntimeSignalCollector } from './runtimeSignals.mjs';

/**
 * @description Audits one route inside a private Chrome target, joining runtime testimony with responsive DOM evidence and explicit readiness policy.
 * @param {Object} options - Page-audit request containing route, base URL, CDP endpoint, timing, viewport, and target-size boundaries.
 * @returns {Promise<Object>} Complete stable page receipt with runtime findings and merged DOM metrics.
 */
export async function auditPage(options) {
	const normalized = normalizePageAuditOptions(options);
	const {
		route,
		url,
		cdpUrl,
		timeoutMs,
		quietMs,
		width,
		height,
		minimumTargetSize
	} = normalized;
	const startedAt = Date.now();
	const client = new CdpTargetClient(cdpUrl);
	const collector = new RuntimeSignalCollector();
	const auditFindings = [];
	let metrics = null;

	try {
		await client.open();
		client.on('*', (event) => {
			collector.observe(event);
		});
		await enableAuditBrowserDomains(client, width, height);

		const loadWitness = waitForAuditEvent(
			client,
			'Page.loadEventFired',
			timeoutMs
		);
		const navigation = await client.send('Page.navigate', { url });
		const navigationFinding = revealNavigationFinding(navigation, url);
		if (navigationFinding) {
			auditFindings.push(navigationFinding);
		}

		const loadedInTime = await loadWitness;
		await waitForAuditQuiet(quietMs);
		const domWitness = await evaluateDomMetrics(
			client,
			minimumTargetSize,
			url
		);
		metrics = domWitness.metrics;
		auditFindings.push(...domWitness.findings);

		const lateLoadFinding = revealLateLoadFinding(
			loadedInTime,
			metrics,
			url,
			timeoutMs
		);
		if (lateLoadFinding) {
			auditFindings.push(lateLoadFinding);
		}
	} catch (error) {
		auditFindings.push(revealAuditCrashFinding(error, url));
	} finally {
		await client.close().catch(() => null);
	}

	const findings = [
		...collector.summary().findings,
		...auditFindings
	];

	return createPageAuditReceipt({
		route,
		url,
		startedAt,
		width,
		height,
		findings,
		metrics
	});
}
