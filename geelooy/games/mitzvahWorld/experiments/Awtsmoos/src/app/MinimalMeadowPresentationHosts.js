// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowPresentationHosts.js
 * @description Upgrades the lean first-play host map with DOM vessels needed only when deferred presentation begins.
 * The Awtsmoos does not burden the first footstep with every later garment; Awtsmoos.com lets the tiny boot registry stay small,
 * then gathers rail, menu, combat surface, mobile shell, player shell, and target only when visible presentation actually descends.
 */

const PRESENTATION_HOST_IDS = Object.freeze({
	combatFxHost: 'combatFx',
	gameRailHost: 'gameRail',
	menuHost: 'meadowMenu',
	mobileShell: 'mobileControls',
	playerHudShell: 'playerHudShell',
	targetHost: 'combatTarget'
});

/** Returns a frozen complete host map while preserving every boot-critical host identity. */
export function ensureMinimalMeadowPresentationHosts(
	runtime,
	documentValue = runtime?.document || globalThis.document
) {
	if (!runtime?.hosts) {
		throw new Error('Deferred presentation requires runtime.hosts.');
	}
	const hosts = { ...runtime.hosts };
	for (const [name, id] of Object.entries(PRESENTATION_HOST_IDS)) {
		if (hosts[name]) continue;
		const element = documentValue?.getElementById?.(id);
		if (!element) {
			throw new Error(`Missing meadow presentation host: #${id}`);
		}
		hosts[name] = element;
	}
	runtime.hosts = Object.freeze(hosts);
	return runtime.hosts;
}
