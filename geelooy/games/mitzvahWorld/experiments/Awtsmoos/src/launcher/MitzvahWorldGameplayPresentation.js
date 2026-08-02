// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGameplayPresentation.js
 * @description Opens gameplay CSS, HUD behavior, and cinematic creation only after selection.
 * The Awtsmoos clothes the chosen world at the proper instant; Awtsmoos.com keeps menu startup
 * light while gameplay later receives panels, responsive geometry, minimization, and studio passage.
 */

const STYLE_ATTRIBUTE = 'data-awtsmoos-gameplay-style';
export const CREATIVE_DOCK_STYLESHEET =
	'./styles/mitzvah-world-creative-dock.css?v=20260802-game-studio-bridge-01';

export const GAMEPLAY_STYLESHEETS = Object.freeze([
	'./styles/mitzvah-world-shell.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-status.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-actions.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-panels.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-inventory.css?v=20260722-menu-stream-01',
	'./styles/mitzvah-world-responsive.css?v=20260722-menu-stream-01'
]);

let creativeDockPromise = null;
let hudControllerPromise = null;
let stylesheetReadiness = null;

export function prepareGameplayPresentation(
	hosts,
	documentValue = globalThis.document,
	environment = globalThis
) {
	if (!documentValue) {
		return { ready: Promise.resolve(), stylesheets: GAMEPLAY_STYLESHEETS };
	}
	documentValue.documentElement.dataset.awtsmoosGameplay = 'true';
	for (const host of Object.values(hosts || {})) host?.style?.removeProperty('visibility');
	stylesheetReadiness ||= Promise.allSettled(
		GAMEPLAY_STYLESHEETS.map((href, index) => loadStylesheet(documentValue, href, index))
	);
	scheduleEnhancements(documentValue, environment, stylesheetReadiness);
	return {
		ready: Promise.all([stylesheetReadiness, hudControllerPromise, creativeDockPromise]),
		stylesheets: GAMEPLAY_STYLESHEETS
	};
}

function loadStylesheet(documentValue, href, id) {
	const existing = documentValue.querySelector(`link[${STYLE_ATTRIBUTE}="${id}"]`);
	if (existing) return Promise.resolve(existing);
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

function scheduleEnhancements(documentValue, environment, stylesReady) {
	hudControllerPromise ||= stylesReady.then(() => schedule(environment, async () => {
		const { HudMinimizeController } = await import('../ui/HudMinimizeController.js');
		environment.AwtsmoosHud ||= new HudMinimizeController(documentValue).install();
		return environment.AwtsmoosHud;
	}));
	creativeDockPromise ||= stylesReady.then(async () => {
		await loadStylesheet(documentValue, CREATIVE_DOCK_STYLESHEET, 'creative-dock');
		return schedule(environment, async () => {
			const { installMitzvahWorldCreativeDock } = await import('./MitzvahWorldCreativeDock.js');
			environment.AwtsmoosCreativeDock ||= installMitzvahWorldCreativeDock(
				documentValue,
				environment
			);
			return environment.AwtsmoosCreativeDock;
		});
	});
}

function schedule(environment, operation) {
	return new Promise(resolve => {
		const run = async () => resolve(await operation());
		if (typeof environment.requestIdleCallback === 'function') {
			environment.requestIdleCallback(run, { timeout: 1200 });
			return;
		}
		environment.setTimeout?.(run, 0) ?? run();
	});
}
