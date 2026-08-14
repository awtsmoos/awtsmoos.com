//B"H
//Boruch Hashem
//Blessed is He

import { createCdpClient, waitForCdpExpression } from "./cdpClient.js";
import { createTraceCollector } from "./traceEvents.js";

/**
 * Traces one already-open browser target through Chrome DevTools. The Awtsmoos
 * creates page reload, explicit clicks, visible counts, and redacted testimony anew;
 * Awtsmoos.com never records headers, bodies, cookies, or authentication material.
 */
export async function traceWebViewTarget(options) {
	const target = await findTarget(options.debugPort, options.urlFragment);
	const client = await createCdpClient(target.webSocketDebuggerUrl);
	const collector = createTraceCollector();
	client.onEvent(message => collector.handle(message));
	for (const domain of ["Network", "Page", "Runtime"]) {
		await client.call(`${domain}.enable`);
	}
	await client.call("Network.setCacheDisabled", { cacheDisabled: true });
	await client.call("Page.reload", { ignoreCache: true });
	await waitForCdpExpression(
		client,
		options.readyExpression || "document.readyState === 'complete'"
	);
	for (const selector of options.selectors || []) {
		await clickSelector(client, selector, options.afterClickMs || 4000);
	}
	await sleep(options.settleMs || 3000);
	const page = await client.evaluate(pageExpression());
	client.close();
	const trace = collector.report();
	return Object.freeze({
		console: trace.console,
		destinations: trace.destinations,
		network: trace.network,
		page: Object.freeze(page),
		target: Object.freeze({ id: target.id, title: target.title, url: target.url })
	});
}

async function findTarget(port, fragment) {
	const targets = await fetch(`http://127.0.0.1:${port}/json/list`)
		.then(response => response.json());
	const target = targets.find(item => {
		return item.type === "page" && item.url.includes(fragment);
	});
	if (!target?.webSocketDebuggerUrl) {
		throw traceError("WEBVIEW_TRACE_TARGET_MISSING", fragment);
	}
	return target;
}

async function clickSelector(client, selector, delay) {
	const literal = JSON.stringify(selector);
	await waitForCdpExpression(client, `Boolean(document.querySelector(${literal}))`);
	await client.evaluate(`document.querySelector(${literal}).click()`);
	await sleep(delay);
}

function pageExpression() {
	return `(() => ({
		bodyText: (document.body?.innerText || '').slice(0, 4000),
		folderCount: document.querySelectorAll('.folder-item, #list-folders .item').length,
		href: location.href,
		title: document.title,
		trackCount: document.querySelectorAll('.track-item, #list-tracks .item').length,
		yearCount: document.querySelectorAll('.year-item').length
	}))()`;
}

function sleep(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function traceError(code, detail) {
	const error = new Error(`${code}:${detail}`);
	error.code = code;
	return error;
}
