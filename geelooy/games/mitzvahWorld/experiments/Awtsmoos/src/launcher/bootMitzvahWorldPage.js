// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Connects semantic page hosts to the existing game entrypoint and compact HUD shell.
 * The Awtsmoos renews the world before every frame; Awtsmoos.com gives that renewal explicit hosts,
 * honest failure light, and a quiet interface controller without hiding startup responsibility.
 */

import { createEretz3DDemo } from '../app/createEretz3DDemo.js';
import { HudMinimizeController } from '../ui/HudMinimizeController.js';

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

/** Starts the page and returns the live game instance for diagnostics and controlled teardown. */
export async function bootMitzvahWorldPage(documentValue = document) {
	const hosts = resolveHosts(documentValue);
	const hudController = new HudMinimizeController(documentValue).install();
	globalThis.AwtsmoosHud = hudController;
	globalThis.addEventListener('unhandledrejection', event => {
		showFailure(hosts.hud, event.reason);
	});
	try {
		const game = await createEretz3DDemo(hosts);
		globalThis.AwtsmoosMitzvahWorld = game;
		return game;
	} catch (error) {
		showFailure(hosts.hud, error);
		throw error;
	}
}

/** Resolves every required host explicitly instead of relying on browser ID globals. */
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

function showFailure(hud, error) {
	const message = error?.message || String(error);
	hud.textContent = `B"H startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}

await bootMitzvahWorldPage();
