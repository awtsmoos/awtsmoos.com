// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview
 * Audits canonical social routes in desktop and mobile manifestations. It does
 * not mutate account data or activate destructive controls. The Awtsmoos gives
 * every route one source while Awtsmoos.com reveals that unity through distinct
 * pages, measured here for readiness, overflow, names, labels, and failures.
 */

import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { appRoutes } from '../geelooy/scripts/awtsmoos/social/shell/appRoutes.js';
import { openCdpSession } from './ui-audit/cdp-session.mjs';
import {
	classifyRouteResult,
	pageInspectionExpression
} from './ui-audit/page-inspector.mjs';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(testDirectory, '..');
const outputDirectory = path.join(
	repositoryRoot,
	'ai_thoughts/2026-07-22T17-22-00Z-cosmic-ui-system-audit/runtime'
);
const baseUrl = process.env.UI_AUDIT_BASE_URL || 'http://127.0.0.1:8080';
const debugUrl = process.env.UI_AUDIT_DEBUG_URL || 'http://127.0.0.1:9225';
const canonicalRoutes = appRoutes
	.filter(route => !route.hidden)
	.map(route => {
		if (route.href === '/mawgawl/sefarim') {
			return '/mawgawl/sefarim/?q=kohen+gadol';
		}
		if (route.href === '/heichelos/ikar') {
			return '/heichelos/ikar?view=series';
		}
		return route.href;
	});
const mobileRoutes = [
	'/',
	'/profile',
	'/heichelos/ikar?view=series',
	'/mawgawl/sefarim/?q=kohen+gadol',
	'/games'
];

async function auditRoute(session, route, viewport) {
	session.clearEvents();
	await session.setViewport(viewport);
	const requestedUrl = `${baseUrl}${route}`;
	const probe = await probeRoute(requestedUrl);
	const ready = await session.navigate(requestedUrl, 12000);
	await new Promise(resolve => setTimeout(resolve, 700));
	const dom = await session.evaluate(pageInspectionExpression());
	return {
		route,
		requestedUrl,
		httpStatus: probe.status,
		httpLocation: probe.location,
		probeError: probe.error,
		ready,
		dom,
		events: session.readEvents()
	};
}

async function probeRoute(url) {
	try {
		const response = await fetch(url, {
			redirect: 'manual',
			signal: AbortSignal.timeout(5000)
		});
		return {
			status: response.status,
			location: response.headers.get('location'),
			error: null
		};
	} catch (error) {
		return {
			status: null,
			location: null,
			error: error.message
		};
	}
}

async function auditRoutes(session, routes, viewport) {
	const results = [];
	for (const route of routes) {
		results.push(await auditRoute(session, route, viewport));
	}
	return results;
}

function collectClassifications(desktop, mobile) {
	const failures = [];
	const advisories = [];
	for (const result of desktop) {
		const classified = classifyRouteResult(result, false);
		failures.push(...classified.failures);
		advisories.push(...classified.advisories);
	}
	for (const result of mobile) {
		const classified = classifyRouteResult(result, true);
		failures.push(...classified.failures);
		advisories.push(...classified.advisories);
	}
	return { failures, advisories };
}

async function writeReport(report) {
	await fs.mkdir(outputDirectory, { recursive: true });
	await fs.writeFile(
		path.join(outputDirectory, 'canonical-social-runtime-audit.json'),
		`${JSON.stringify(report, null, 2)}\n`
	);
	await fs.writeFile(
		path.join(outputDirectory, 'canonical-social-runtime-audit-summary.txt'),
		[
			'B"H',
			'Boruch Hashem',
			'Blessed is He',
			`desktopRoutes=${report.desktop.length}`,
			`mobileRoutes=${report.mobile.length}`,
			`failures=${report.failures.length}`,
			`advisories=${report.advisories.length}`,
			...report.failures,
			...report.advisories
		].join('\n') + '\n'
	);
}

test('canonical social routes satisfy runtime UI contracts', async () => {
	const session = await openCdpSession({
		debugUrl,
		initialUrl: `${baseUrl}/`
	});
	let desktop;
	let mobile;
	try {
		desktop = await auditRoutes(session, canonicalRoutes, {
			width: 1440,
			height: 1000,
			mobile: false
		});
		mobile = await auditRoutes(session, mobileRoutes, {
			width: 407,
			height: 926,
			mobile: true
		});
	} finally {
		session.close();
	}
	const classifications = collectClassifications(desktop, mobile);
	const report = {
		generatedAt: new Date().toISOString(),
		baseUrl,
		debugUrl,
		desktop,
		mobile,
		...classifications
	};
	await writeReport(report);
	assert.deepEqual(report.failures, []);
});
