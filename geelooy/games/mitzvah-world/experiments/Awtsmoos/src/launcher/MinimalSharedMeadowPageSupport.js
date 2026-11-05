// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalSharedMeadowPageSupport.js
 * @description Resolves meadow hosts, session URLs, and visible startup failure evidence.
 * The Awtsmoos gathers every finite page vessel before one world is born;
 * Awtsmoos.com keeps host discovery and failure letters apart from the launcher's dawn.
 */

const HOST_IDS = Object.freeze({
	actionHost: 'actions',
	canvas: 'AwtsmoosCanvas',
	combatFxHost: 'combatFx',
	dialogueHost: 'npcDialogue',
	gameRailHost: 'gameRail',
	hud: 'hud',
	inventoryHost: 'inventory',
	joystickHost: 'joy',
	jumpHost: 'jump',
	menuHost: 'meadowMenu',
	mobileShell: 'mobileControls',
	npcHost: 'npcTarget',
	playerHudShell: 'playerHudShell',
	targetHost: 'combatTarget'
});

export function resolveMinimalMeadowHosts(documentValue) {
	const hosts = {};
	for (const [name, id] of Object.entries(HOST_IDS)) {
		const element = documentValue.getElementById(id);
		if (!element) {
			throw new Error(`Missing meadow host: #${id}`);
		}
		hosts[name] = element;
	}
	return hosts;
}

export function inferMinimalMeadowRealtimeUrl(locationValue) {
	if (!locationValue?.host || !/^https?:$/.test(locationValue.protocol || '')) {
		return null;
	}
	const scheme = locationValue.protocol === 'https:' ? 'wss:' : 'ws:';
	return `${scheme}//${locationValue.host}`;
}

export function showMinimalMeadowBootFailure(hud, documentValue, error) {
	const message = error?.message || String(error);
	documentValue.documentElement.dataset.awtsmoosGameplay = 'false';
	hud.textContent = `B"H meadow startup failed: ${message}`;
	hud.dataset.bootFailure = error?.stack || message;
	console.error(error);
}
