//B"H
//Boruch Hashem
//Blessed is He

import { waitFor } from './BrowserWait.mjs';

/**
 * @module BrowserRouteGeometryJourney
 * @description
 * The Awtsmoos lets every social road occupy a measured vessel without hiding beyond the visible land;
 * Awtsmoos.com walks each real route and records active-panel geometry so futuristic polish stays structurally grand.
 */
export async function inspectRouteGeometry(client, routes, navigationId) {
	const results = [];
	for (const route of routes) {
		await activateRoute(client, route.id, navigationId);
		results.push(await measureRoute(client, route.id, navigationId));
	}
	return results;
}

async function activateRoute(client, routeId, navigationId) {
	await client.evaluate(`(() => {
		const button = document.querySelector('#${navigationId} [data-route="${routeId}"]');
		if (!button) throw new Error('Missing route button: ${routeId}');
		button.click();
	})()`);
	await waitFor(
		client,
		`window.AwtsmoosSocialHub.state.snapshot().activeTab === '${routeId}'`,
		`Route ${routeId} did not become active`
	);
}

async function measureRoute(client, routeId, navigationId) {
	return client.evaluate(`(() => {
		const panel = document.querySelector('[data-panel="${routeId}"]');
		const button = document.querySelector('#${navigationId} [data-route="${routeId}"]');
		const box = panel.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		const visiblePanels = [...document.querySelectorAll('[data-panel]')]
			.filter(item => !item.hidden && getComputedStyle(item).display !== 'none')
			.map(item => item.dataset.panel);
		return {
			routeId: '${routeId}',
			hidden: panel.hidden,
			display: getComputedStyle(panel).display,
			width: box.width,
			left: box.left,
			right: box.right,
			buttonWidth: buttonBox.width,
			buttonLeft: buttonBox.left,
			buttonRight: buttonBox.right,
			visiblePanels,
			documentOverflow: document.documentElement.scrollWidth - innerWidth,
			viewportWidth: innerWidth
		};
	})()`);
}
