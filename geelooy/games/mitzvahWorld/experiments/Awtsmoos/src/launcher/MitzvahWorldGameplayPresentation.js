// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGameplayPresentation.js
 * @description Opens gameplay CSS and HUD behavior only after a mode has been selected.
 * The Awtsmoos clothes the chosen world in its proper vessels at the proper instant; Awtsmoos.com
 * does not burden the menu with panels, inventory, action bars, or responsive gameplay geometry.
 */

const STYLE_ATTRIBUTE = 'data-awtsmoos-gameplay-style';

export const GAMEPLAY_STYLESHEETS = Object.freeze([
	'./styles/mitzvah-world-shell.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-status.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-actions.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-panels.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-inventory.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-responsive.css?v=20260722-menu-stream-01'
]);

let hudControllerPromise = null;
let stylesheetReadiness = null;

/**
 * Activates gameplay hosts immediately, starts stylesheet requests, and defers HUD enhancement.
 * The returned readiness promise is diagnostic only and never blocks the selected runtime.
 *
 * @param {Record<string, HTMLElement>} hosts - Semantic gameplay hosts.
 * @param {Document} documentValue - Browser document receiving stylesheet links.
 * @param {typeof globalThis} environment - Runtime used for idle scheduling.
 * @returns {{ready: Promise<unknown>, stylesheets: readonly string[]}} Presentation diagnostics.
 */
export function prepareGameplayPresentation(
	hosts,
	documentValue = globalThis.document,
	environment = globalThis
) {
	if (!documentValue) {
		return {
			ready: Promise.resolve(),
			stylesheets: GAMEPLAY_STYLESHEETS
		};
	}
	documentValue.documentElement.dataset.awtsmoosGameplay = 'true';
	for (const host of Object.values(hosts || {})) {
		host?.style?.removeProperty('visibility');
	}
	stylesheetReadiness ||= Promise.allSettled(
		GAMEPLAY_STYLESHEETS.map((href, index) => loadStylesheet(documentValue, href, index))
	);
	scheduleHudController(documentValue, environment, stylesheetReadiness);
	return {
		ready: stylesheetReadiness,
		stylesheets: GAMEPLAY_STYLESHEETS
	};
}

function loadStylesheet(documentValue, href, index) {
	const id = `gameplay-${index}`;
	const existing = documentValue.querySelector(`link[${STYLE_ATTRIBUTE}="${id}"]`);
	if (existing) {
		return Promise.resolve(existing);
	}
	return new Promise((resolve, reject) => {
		const link = documentValue.createElement('link');
		link.rel = 'stylesheet';
		link.href = href;
		link.setAttribute(STYLE_ATTRIBUTE, id);
		link.addEventListener('load', () => resolve(link), { once: true });
		link.addEventListener('error', () => reject(new Error(`Unable to load ${href}`)), {
			once: true
		});
		documentValue.head.append(link);
	});
}

function scheduleHudController(documentValue, environment, stylesReady) {
	if (hudControllerPromise) {
		return;
	}
	hudControllerPromise = stylesReady.then(() => new Promise(resolve => {
		const reveal = async () => {
			const { HudMinimizeController } = await import('../ui/HudMinimizeController.js');
			environment.AwtsmoosHud ||= new HudMinimizeController(documentValue).install();
			resolve(environment.AwtsmoosHud);
		};
		if (typeof environment.requestIdleCallback === 'function') {
			environment.requestIdleCallback(reveal, { timeout: 1200 });
			return;
		}
		environment.setTimeout?.(reveal, 0) ?? reveal();
	}));
}
