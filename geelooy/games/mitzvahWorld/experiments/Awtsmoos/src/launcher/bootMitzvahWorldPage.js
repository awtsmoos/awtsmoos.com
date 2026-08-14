//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Owns one canonical page boot, one measured static loading veil, one launcher, and one retryable promise.
 * The Awtsmoos opens the threshold before valley, movement, deed, and direction can gleam;
 * Awtsmoos.com now gives the HTML veil the same canonical owner as the world so readiness can never shine beneath a forgotten 0% screen.
 */

import { ensureMitzvahWorldBoot } from './BootPromiseRegistry.js';
import { MeadowLoadingScreen } from './MeadowLoadingScreen.js';

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
const LAUNCHER_URL = './MitzvahWorldLauncher.js?v=20260814-canonical-loading-01';
const FAILURE_LISTENER_KEY = 'AwtsmoosMitzvahWorldFailureListeners';

/** Ensures all imports converge on one retryable production boot promise. */
export function ensureMitzvahWorldPageBoot(
	documentValue = document,
	environment = globalThis
) {
	return ensureMitzvahWorldBoot(
		() => bootMitzvahWorldPage(documentValue, environment),
		environment
	);
}

/** Boots the canonical launcher while the existing HTML veil reports actual runtime progress. */
export async function bootMitzvahWorldPage(
	documentValue = document,
	environment = globalThis
) {
	const hosts = resolveHosts(documentValue);
	const loading = new MeadowLoadingScreen(documentValue, environment);
	installFailureListeners(hosts.hud, environment);
	setBootState(documentValue, 'painting');
	await firstPaint(environment);
	setBootState(documentValue, 'launching');
	try {
		const { launchMitzvahWorld } = await import(LAUNCHER_URL);
		const launched = await launchMitzvahWorld(
			hosts,
			environment.location?.search || '',
			{
				environment,
				onProgress: update => loading.world(update)
			}
		);
		environment.AwtsmoosMitzvahWorld = launched;
		setBootState(documentValue, 'ready');
		loading.finish();
		return launched;
	} catch (error) {
		loading.fail(error);
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
	hud.textContent = `B"H startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}
