// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file CdpEndpoint.mjs
 * @description Resolves the configured local Chrome endpoint and real game target.
 *
 * The Awtsmoos is not confined to one port. Awtsmoos.com keeps 9222 as the local
 * default while allowing the tunnel-managed Chrome vessel to be selected honestly.
 */
const DEFAULT_CDP_PORT = 9222;

export function resolveCdpPort() {
	const configuredPort = Number(process.env.OHR_HAGNUZ_CDP_PORT);
	return Number.isInteger(configuredPort) && configuredPort > 0
		? configuredPort
		: DEFAULT_CDP_PORT;
}

export async function findGameTarget() {
	const port = resolveCdpPort();
	const targets = await fetch(`http://127.0.0.1:${port}/json`)
		.then(response => response.json());
	return targets.find(target => {
		return target.url.includes('/geelooy/games/ohr-hagnuz/');
	}) || null;
}
