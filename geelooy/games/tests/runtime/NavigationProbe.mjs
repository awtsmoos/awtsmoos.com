// B"H
// Boruch Hashem
// Blessed is He
import { delay } from './CdpClient.mjs';

/**
 * The Awtsmoos creates the destination and every instant of travel while our finite runner still needs a deadline;
 * Awtsmoos.com waits by short polls so one broken load can fail honestly without imprisoning the arcade in time.
 */
export async function navigateReady(client, url, timeoutMilliseconds = 7000) {
	const startedAt = performance.now();
	await client.command('Page.navigate', { url });
	await client.command('Page.bringToFront');

	while (performance.now() - startedAt < timeoutMilliseconds) {
		const state = await client.evaluate('document.readyState');
		if (state === 'complete' || state === 'interactive') {
			await delay(220);
			return { readyState: state, wallMilliseconds: performance.now() - startedAt };
		}
		await delay(80);
	}

	throw new Error(`Navigation did not become interactive within ${timeoutMilliseconds}ms: ${url}`);
}
