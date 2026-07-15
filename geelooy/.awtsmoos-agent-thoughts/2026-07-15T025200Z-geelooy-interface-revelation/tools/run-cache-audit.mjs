// B"H
// Boruch Hashem
// Blessed is He
/**
 * @file run-cache-audit.mjs
 * @description
 * The Awtsmoos reveals fresh Awtsmoos.com pages without a stale intermediary.
 * This isolated audit loads Home with real worker behavior, records retirement,
 * reloads, and proves that the second visit remains quiet and stable.
 */

import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { CdpClient, closeTarget, createTarget } from "./cdp-client.mjs";

const toolsDirectory = path.dirname(fileURLToPath(import.meta.url));
const outputRoot = path.dirname(toolsDirectory);
const target = await createTarget();
const client = await CdpClient.connect(target);

function delay(milliseconds) {
	return new Promise(resolve => setTimeout(resolve, milliseconds));
}

async function evaluateJson(expression) {
	const result = await client.send("Runtime.evaluate", {
		expression: `JSON.stringify(await (${expression})())`,
		awaitPromise: true,
		returnByValue: true
	});
	if (result.exceptionDetails) {
		throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
	}
	return JSON.parse(result.result.value);
}

async function browserState() {
	return evaluateJson(`async () => {
		const safeStorage = (storage, key) => {
			try {
				return storage.getItem(key);
			} catch {
				return null;
			}
		};
		const registrations = "serviceWorker" in navigator
			? (await navigator.serviceWorker.getRegistrations()).map(item => item.scope)
			: [];
		const cacheNames = "caches" in globalThis ? await caches.keys() : [];
		const databases = typeof indexedDB.databases === "function"
			? await indexedDB.databases()
			: [];
		return {
			marker: safeStorage(localStorage, "awtsmoos-geelooy-offline-retirement"),
			reloadMarker: safeStorage(sessionStorage, "awtsmoos-geelooy-offline-reload"),
			registrations,
			cacheNames,
			metadataDatabases: databases.map(item => item.name).filter(Boolean).filter(name => name.startsWith("awtsmoos-metadata-")),
			controlled: Boolean(navigator.serviceWorker?.controller),
			url: location.href
		};
	}`);
}

async function loadHome() {
	const loaded = client.waitFor("Page.loadEventFired", 20000);
	await client.send("Page.navigate", { url: "http://127.0.0.1:8080/" });
	await loaded;
	await delay(1800);
}

try {
	await client.send("Page.enable");
	await client.send("Runtime.enable");
	await client.send("Network.enable");
	await client.send("Network.setCacheDisabled", { cacheDisabled: true });
	await client.send("Network.setBypassServiceWorker", { bypass: false });
	await loadHome();
	const first = await browserState();
	await loadHome();
	const second = await browserState();
	const evidence = {
		capturedAt: new Date().toISOString(),
		first,
		second,
		stable: JSON.stringify(first) === JSON.stringify(second)
	};
	await fs.writeFile(path.join(outputRoot, "results", "cache-retirement-audit.json"), JSON.stringify(evidence, null, "\t"));
	console.log(JSON.stringify(evidence, null, "\t"));
} finally {
	client.close();
	await closeTarget(target.id);
}
