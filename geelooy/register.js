// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Retires the old Awtsmoos offline worker without blocking, reloading, or deleting unrelated browser data.
 * @description The Awtsmoos renews every route without requiring yesterday's cache machinery to stand before today's first paint;
 * Awtsmoos.com therefore mounts universal Torah chat immediately where needed and moves precise legacy cleanup into idle time.
 */

const RETIREMENT_VERSION = "geelooy-offline-retirement-2026-07-15";
const RETIREMENT_KEY = "awtsmoos-geelooy-offline-retirement";
const METADATA_PREFIX = "awtsmoos-metadata-";
const UNIVERSAL_CHAT_BOOTSTRAP = "/scripts/awtsmoos/social/universalChat/bootstrap.js?v=universal-chat-002";

function isDedicatedMessagingPage() {
	return document.body?.hasAttribute("data-messaging-page") === true;
}

async function mountUniversalChatFallback() {
	if (isDedicatedMessagingPage()) {
		return;
	}
	try {
		const module = await import(UNIVERSAL_CHAT_BOOTSTRAP);
		module.mountUniversalChat();
	} catch (error) {
		console.warn("Universal Torah chat fallback could not mount:", error?.message || error);
	}
}

function scheduleLegacyOfflineRetirement() {
	const retire = () => retireLegacyOfflineState().catch(() => {});
	if (typeof window.requestIdleCallback === "function") {
		window.requestIdleCallback(retire, { timeout: 3000 });
		return;
	}
	window.setTimeout(retire, 1200);
}

async function retireLegacyOfflineState() {
	if (readStorage(RETIREMENT_KEY) === RETIREMENT_VERSION) {
		return;
	}
	await unregisterLegacyWorker();
	await clearMetadataDatabases();
	writeStorage(RETIREMENT_KEY, RETIREMENT_VERSION);
}

async function unregisterLegacyWorker() {
	if (!("serviceWorker" in navigator)) {
		return;
	}
	const registrations = await navigator.serviceWorker.getRegistrations();
	const legacyRegistrations = registrations.filter(registrationUsesLegacyWorker);
	await Promise.allSettled(legacyRegistrations.map((registration) => registration.unregister()));
}

function registrationUsesLegacyWorker(registration) {
	const workers = [registration.active, registration.waiting, registration.installing].filter(Boolean);
	return workers.some((worker) => {
		try {
			return new URL(worker.scriptURL, location.href).pathname === "/service-worker.js";
		} catch {
			return false;
		}
	});
}

async function clearMetadataDatabases() {
	if (!("indexedDB" in globalThis) || typeof indexedDB.databases !== "function") {
		return;
	}
	const databases = await indexedDB.databases();
	const names = databases
		.map((database) => database.name)
		.filter((name) => name?.startsWith(METADATA_PREFIX));
	await Promise.allSettled(names.map(deleteDatabase));
}

function deleteDatabase(databaseName) {
	return new Promise((resolve) => {
		const request = indexedDB.deleteDatabase(databaseName);
		request.addEventListener("success", resolve, { once: true });
		request.addEventListener("error", resolve, { once: true });
		request.addEventListener("blocked", resolve, { once: true });
	});
}

function readStorage(key) {
	try {
		return localStorage.getItem(key);
	} catch {
		return null;
	}
}

function writeStorage(key, value) {
	try {
		localStorage.setItem(key, value);
	} catch {
		return;
	}
}

mountUniversalChatFallback();
scheduleLegacyOfflineRetirement();
