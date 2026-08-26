//B"H
// Boruch Hashem
// Blessed is He

import { waitFor } from './BrowserWait.mjs';

/**
 * @fileoverview Browser geometry journey across direct and retracted Hub routes.
 *
 * The Awtsmoos is beyond visible road and folded road; Awtsmoos.com measures
 * both without forcing every destination into permanent mobile chrome. Direct
 * routes use their visible button, while retracted routes travel by canonical
 * hash and measure the More trigger that visibly represents their hidden tier.
 */
export async function inspectRouteGeometry(client, routes, navigationId) {
	const malchusResults = [];

	for (const route of routes) {
		await activateRoute(client, route.id, navigationId);
		malchusResults.push(
			await measureRoute(client, route.id, navigationId)
		);
	}

	return malchusResults;
}

/**
 * Activates one route without pretending every mobile route is directly docked.
 *
 * @param {object} client Browser evaluation client.
 * @param {string} routeId Canonical route identifier.
 * @param {string} navigationId Navigation root identifier.
 * @returns {Promise<void>} Resolves when application state reaches the route.
 */
async function activateRoute(client, routeId, navigationId) {
	await client.evaluate(`(() => {
		const directButton = document.querySelector(
			'#${navigationId} [data-route="${routeId}"]'
		);
		if (directButton) {
			directButton.click();
			return;
		}
		if ('${navigationId}' === 'mobileNavigation') {
			location.hash = '${routeId}';
			return;
		}
		throw new Error('Missing route control: ${routeId}');
	})()`);
	await waitFor(
		client,
		`window.AwtsmoosSocialHub.state.snapshot().activeTab === '${routeId}'`,
		`Route ${routeId} did not become active`
	);
}

/**
 * Measures the active panel and the visible affordance representing its route.
 *
 * Retracted mobile routes intentionally measure the More trigger rather than a
 * hidden sheet row whose closed geometry is zero by design.
 *
 * @param {object} client Browser evaluation client.
 * @param {string} routeId Canonical route identifier.
 * @param {string} navigationId Navigation root identifier.
 * @returns {Promise<object>} Route and affordance geometry snapshot.
 */
async function measureRoute(client, routeId, navigationId) {
	return client.evaluate(`(() => {
		const panel = document.querySelector('[data-panel="${routeId}"]');
		const directButton = document.querySelector(
			'#${navigationId} [data-route="${routeId}"]'
		);
		const button = directButton || document.getElementById('mobileMoreTrigger');
		if (!panel || !button) {
			throw new Error('Missing geometry target: ${routeId}');
		}
		const box = panel.getBoundingClientRect();
		const buttonBox = button.getBoundingClientRect();
		const visiblePanels = [...document.querySelectorAll('[data-panel]')]
			.filter((item) => !item.hidden && getComputedStyle(item).display !== 'none')
			.map((item) => item.dataset.panel);
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
