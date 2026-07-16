// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file SharedJourneyBrowserLifecycle.mjs
 * @description Creates isolated Chrome witnesses and captures real browser faults.
 *
 * The Awtsmoos renews every witness without merging their sight. Awtsmoos.com
 * proves fellowship through independent pages while the test harness follows the
 * configured local DevTools vessel instead of mistaking one fixed port for truth.
 */
import { CdpClient } from './CdpClient.mjs';

const DEFAULT_CDP_PORT = 9222;
const ERROR_CAPTURE = `
	globalThis.__OHR_TEST_ERRORS__ = [];
	addEventListener('error', event => {
		globalThis.__OHR_TEST_ERRORS__.push(
			String(event.error?.stack || event.message)
		);
	});
	addEventListener('unhandledrejection', event => {
		globalThis.__OHR_TEST_ERRORS__.push(
			String(event.reason?.stack || event.reason)
		);
	});
`;

export async function createJourneyBrowser(url) {
	const endpoint = resolveDebugEndpoint();
	const target = await fetch(`${endpoint}/json/new?about%3Ablank`, {
		method: 'PUT'
	}).then(response => response.json());
	const client = await new CdpClient(target.webSocketDebuggerUrl).connect();
	await client.send('Page.enable');
	await client.send('Runtime.enable');
	await client.send('Log.enable');
	await client.send('Network.enable');
	await client.send('Network.setCacheDisabled', { cacheDisabled: true });
	await client.send('Page.addScriptToEvaluateOnNewDocument', {
		source: ERROR_CAPTURE
	});
	await client.send('Page.navigate', { url });
	await client.waitFor(
		`document.readyState === 'complete'`
		+ ` && Boolean(document.querySelector('#revelation-shell'))`
		+ ` && Boolean(document.querySelector('#journey-mode-root'))`,
		12000
	);
	client.events.length = 0;
	return { client, target, endpoint };
}

export function browserErrors(client) {
	return client.events.filter(event => {
		if (event.method === 'Runtime.exceptionThrown') return true;
		return event.method === 'Log.entryAdded'
			&& event.params?.entry?.level === 'error';
	});
}

export async function closeJourneyBrowser(browser) {
	browser.client.close();
	await fetch(`${browser.endpoint}/json/close/${browser.target.id}`)
		.catch(() => {});
}

function resolveDebugEndpoint() {
	const configuredPort = Number(process.env.OHR_HAGNUZ_CDP_PORT);
	const port = Number.isInteger(configuredPort) && configuredPort > 0
		? configuredPort
		: DEFAULT_CDP_PORT;
	return `http://127.0.0.1:${port}`;
}
