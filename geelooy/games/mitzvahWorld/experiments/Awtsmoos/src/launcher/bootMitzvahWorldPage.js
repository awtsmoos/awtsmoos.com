// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Reveals the lightweight menu before importing any gameplay runtime.
 * The Awtsmoos creates the threshold before the valley: one tiny page module waits for the first
 * paint, then asks Awtsmoos.com for the menu router while renderer, terrain, actors, inventory,
 * cinema, and multiplayer remain beyond the gate until the player chooses them.
 */

const HOST_IDS = Object.freeze({
	actionHost: 'actions',
	canvas: 'AwtsmoosCanvas',
	dialogueHost: 'npcDialogue',
	hud: 'hud',
	inventoryHost: 'inventory',
	joystickHost: 'joy',
	jumpHost: 'jump',
	npcHost: 'npcTarget'
});

const LAUNCHER_URL = './MitzvahWorldLauncher.js?v=20260722-menu-stream-01';

/**
 * Boots the menu path without placing the gameplay dependency graph in the initial module graph.
 *
 * @param {Document} documentValue - Document containing semantic page hosts.
 * @param {Window|typeof globalThis} environment - Browser-like runtime used for paint scheduling.
 * @returns {Promise<unknown>} The menu element or directly requested mode diagnostics.
 */
export async function bootMitzvahWorldPage(
	documentValue = document,
	environment = globalThis
) {
	const hosts = resolveHosts(documentValue);
	installFailureListeners(hosts.hud, environment);
	await firstPaint(environment);
	try {
		const { launchMitzvahWorld } = await import(LAUNCHER_URL);
		const launched = await launchMitzvahWorld(
			hosts,
			environment.location?.search || '',
			{ environment }
		);
		documentValue.documentElement.dataset.awtsmoosMenuReady = 'true';
		environment.AwtsmoosMitzvahWorld = launched;
		return launched;
	} catch (error) {
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

/** Resolves every host explicitly so browser-created ID globals are never required. */
export function resolveHosts(documentValue) {
	const hosts = {};
	for (const [name, id] of Object.entries(HOST_IDS)) {
		const element = documentValue.getElementById(id);
		if (!element) {
			throw new Error(`Missing Mitzvah World host: #${id}`);
		}
		hosts[name] = element;
	}
	return hosts;
}

function firstPaint(environment) {
	return new Promise(resolve => {
		if (typeof environment.requestAnimationFrame === 'function') {
			environment.requestAnimationFrame(() => resolve());
			return;
		}
		environment.setTimeout?.(resolve, 0) ?? resolve();
	});
}

function installFailureListeners(hud, environment) {
	environment.addEventListener?.('error', event => {
		showFailure(hud, environment.document, event.error || event.message);
	});
	environment.addEventListener?.('unhandledrejection', event => {
		showFailure(hud, environment.document, event.reason);
	});
}

function showFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	documentValue?.documentElement?.setAttribute('data-awtsmoos-menu-ready', 'true');
	hud.textContent = `B"H startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}

if (typeof document !== 'undefined') {
	await bootMitzvahWorldPage();
}
