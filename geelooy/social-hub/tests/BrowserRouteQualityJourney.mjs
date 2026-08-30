//B"H
//Boruch Hashem
//Blessed is He

import assert from 'node:assert/strict';
import { ROUTES } from '../js/navigation/RouteModel.js';
import { inspectRouteSurface } from './BrowserSurfaceQualityInspector.mjs';
import { waitFor } from './BrowserWait.mjs';

/**
 * @module BrowserRouteQualityJourney
 * @description
 * The Awtsmoos leads one mobile browser through every social chamber without confusing movement with proof;
 * Awtsmoos.com names each route as it enters and leaves, so slow living loads become visible evidence instead of silent mystery.
 */

/** Waits for the canonical active-panel covenant after one hash route transition. */
async function waitForRoute(client, routeId) {
	const selector = `[data-panel="${routeId}"]`;
	await waitFor(
		client,
		`(() => {
			const panel = document.querySelector(${JSON.stringify(selector)});
			if (!panel || panel.hidden || panel.dataset.active !== 'true') return false;
			const rect = panel.getBoundingClientRect();
			return rect.width > 0 && rect.height > 0 && ${JSON.stringify(routeId)};
		})()`,
		`Route ${routeId} never became the visible active panel`
	);
	await client.evaluate('new Promise(resolve => setTimeout(resolve, 120))');
}

/** Produces one compact assertion message without hiding the browser's exact samples. */
function revealFailure(routeId, category, samples) {
	return `${routeId} ${category}: ${JSON.stringify(samples)}`;
}

/**
 * Traverses every live Social route at the caller's mobile viewport and proves objective surface quality.
 * @param {Object} client Connected CDP client.
 * @returns {Promise<Array<Object>>} Route-by-route browser evidence.
 */
export async function proveAllRouteSurfaces(client) {
	const evidence = [];
	for (const route of ROUTES) {
		const startedAt = Date.now();
		console.log(`B"H route-quality entering ${route.id}`);
		await client.evaluate(`location.hash = ${JSON.stringify(route.id)}`);
		await waitForRoute(client, route.id);
		const routeEvidence = await inspectRouteSurface(client, route.id);
		assert.equal(routeEvidence.panelActive, true, `${route.id} panel is not active`);
		assert.ok(routeEvidence.panelWidth > 0, `${route.id} panel has no width`);
		assert.ok(routeEvidence.panelHeight > 0, `${route.id} panel has no height`);
		assert.ok(routeEvidence.documentOverflow <= 1, `${route.id} document overflows by ${routeEvidence.documentOverflow}px`);
		assert.equal(routeEvidence.escaped.length, 0, revealFailure(route.id, 'horizontal escape', routeEvidence.escaped));
		assert.equal(routeEvidence.invisibleText.length, 0, revealFailure(route.id, 'invisible text', routeEvidence.invisibleText));
		assert.equal(routeEvidence.looseText.length, 0, revealFailure(route.id, 'loose direct text', routeEvidence.looseText));
		assert.equal(routeEvidence.undersizedControls.length, 0, revealFailure(route.id, 'undersized controls', routeEvidence.undersizedControls));
		evidence.push(routeEvidence);
		console.log(`B"H route-quality passed ${route.id} in ${Date.now() - startedAt}ms`);
	}
	return evidence;
}
