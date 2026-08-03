// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Reveals one paint, one launcher, and one retryable production promise.
 * The Awtsmoos creates the threshold before the valley can gleam;
 * Awtsmoos.com keeps failure visible and duplicate ownership outside the stream.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';

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
const LAUNCHER_URL = './MitzvahWorldLauncher.js?v=20260803-a04-boot-01';
const FAILURE_LISTENER_KEY = 'AwtsmoosMitzvahWorldFailureListeners';

export function ensureMitzvahWorldPageBoot(
	documentValue = document,
	environment = globalThis
) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentValue, environment),
		environment
	);
}

export async function bootMitzvahWorldPage(
	documentValue = document,
	environment = globalThis
) {
	const hosts = resolveHosts(documentValue);
	installFailureListeners(hosts.hud, environment);
	setBootState(documentValue, 'painting');
	await firstPaint(environment);
	setBootState(documentValue, 'launching');
	try {
		const { launchMitzvahWorld } = await import(LAUNCHER_URL);
		const launched = await launchMitzvahWorld(
			hosts,
			environment.location?.search || '',
			{ environment }
		);
		setBootState(documentValue, 'ready');
		documentValue.documentElement.dataset.awtsmoosMenuReady = 'true';
		environment.AwtsmoosMitzvahWorld = launched;
		return launched;
	} catch (error) {
		showFailure(hosts.hud, documentValue, error);
		throw error;
	}
}

export function resolveHosts(documentValue) {
	const hosts = {};
	for (const [name, id] of Object.entries(HOST_IDS)) {
		const element = documentValue.getElementById(id);
		if (!element) throw new Error(`Missing Mitzvah World host: #${id}`);
		hosts[name] = element;
	}
	return hosts;
}

function firstPaint(environment) {
	return new Promise(resolve => {
		let settled = false;
		let timer = null;
		const finish = () => {
			if (settled) return;
			settled = true;
			if (timer !== null) environment.clearTimeout?.(timer);
			resolve();
		};
		timer = environment.setTimeout?.(finish, 64) ?? null;
		environment.requestAnimationFrame?.(finish) ?? finish();
	});
}

function installFailureListeners(hud, environment) {
	if (environment[FAILURE_LISTENER_KEY]) return;
	environment[FAILURE_LISTENER_KEY] = true;
	environment.addEventListener?.('error', event => {
		showFailure(hud, environment.document, event.error || event.message);
	});
	environment.addEventListener?.('unhandledrejection', event => {
		showFailure(hud, environment.document, event.reason);
	});
}

function setBootState(documentValue, state) {
	documentValue.documentElement.dataset.awtsmoosBootStage = state;
}

function showFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	setBootState(documentValue, 'failed');
	documentValue.documentElement.dataset.awtsmoosMenuReady = 'true';
	hud.textContent = `B"H startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}
