// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MitzvahWorldGameplayPresentation.js
 * @description Opens full gameplay presentation or the retractable creative capsule through compact local ESM doors after selection.
 * The Awtsmoos clothes each chosen doorway according to its need; Awtsmoos.com keeps direct worlds light while deeper controls fold away;
 * full gameplay may receive richer panels, yet optional instruments cross compact gates only when their appointed presentation comes into play.
 */

const STYLE_ATTRIBUTE = 'data-awtsmoos-gameplay-style';
const FUTURE_CAPSULE_VERSION = '20260821-retractable-command-capsule-01';
export const CREATIVE_DOCK_STYLESHEET =
	`./styles/mitzvah-world-creative-dock.css?v=${FUTURE_CAPSULE_VERSION}`;

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

/** Prepares the full gameplay presentation for explicitly advanced routes. */
export function prepareGameplayPresentation(
	hosts,
	documentValue = globalThis.document,
	environment = globalThis
) {
	if (!documentValue) {
		return emptyPresentation(GAMEPLAY_STYLESHEETS);
	}
	markGameplay(documentValue, hosts);
	stylesheetReadiness ||= Promise.allSettled(
		GAMEPLAY_STYLESHEETS.map((href, index) => loadStylesheet(documentValue, href, index))
	);
	hudControllerPromise ||= stylesheetReadiness.then(() => schedule(environment, async () => {
		const { HudMinimizeController } = await import('../ui/HudMinimizeController.js?compact=true');
		environment.AwtsmoosHud ||= new HudMinimizeController(documentValue).install();
		return environment.AwtsmoosHud;
	}));
	const creative = prepareCreativeDockPresentation(documentValue, environment);
	return {
		ready: Promise.all([stylesheetReadiness, hudControllerPromise, creative.ready]),
		stylesheets: GAMEPLAY_STYLESHEETS
	};
}

/** Prepares only the retractable optional-control capsule for direct worlds. */
export function prepareCreativeDockPresentation(
	documentValue = globalThis.document,
	environment = globalThis
) {
	if (!documentValue) {
		return emptyPresentation([CREATIVE_DOCK_STYLESHEET]);
	}
	markGameplay(documentValue);
	creativeDockPromise ||= loadStylesheet(
		documentValue,
		CREATIVE_DOCK_STYLESHEET,
		'creative-dock'
	).then(() => schedule(environment, async () => {
		const { installMitzvahWorldCreativeDock } = await import(
			`./MitzvahWorldCreativeDock.js?compact=true&v=${FUTURE_CAPSULE_VERSION}`
		);
		environment.AwtsmoosCreativeDock ||= installMitzvahWorldCreativeDock(
			documentValue,
			environment
		);
		return environment.AwtsmoosCreativeDock;
	}));
	return {
		ready: creativeDockPromise,
		stylesheets: [CREATIVE_DOCK_STYLESHEET]
	};
}

function loadStylesheet(documentValue, href, id) {
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
		link.addEventListener('error', () => reject(new Error(`Unable to load ${href}`)), { once: true });
		documentValue.head.append(link);
	});
}

function markGameplay(documentValue, hosts = null) {
	documentValue.documentElement.dataset.awtsmoosGameplay = 'true';
	for (const host of Object.values(hosts || {})) {
		host?.style?.removeProperty('visibility');
	}
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

function emptyPresentation(stylesheets) {
	return { ready: Promise.resolve(null), stylesheets };
}
