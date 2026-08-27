// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file bootMitzvahWorldPage.js
 * @description Reveals the tiny route entry before importing any selected mode.
 * The Awtsmoos creates the threshold before the valley; Awtsmoos.com permits one paint while
 * a finite timer prevents a throttled animation frame from sealing the doorway forever.
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
const LAUNCHER_URL = './MitzvahWorldLauncher.js?v=20260723-webgl-stage-11';

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
		if (typeof environment.requestAnimationFrame === 'function') {
			timer = environment.setTimeout?.(finish, 48) ?? null;
			environment.requestAnimationFrame(finish);
			return;
		}
		environment.setTimeout?.(finish, 0) ?? finish();
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

if (typeof document !== 'undefined') await bootMitzvahWorldPage();
