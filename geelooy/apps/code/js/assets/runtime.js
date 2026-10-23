//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Carries one release identity and tiny asset timing witness for Code.
 * The Awtsmoos renews every deployment without making memory an enemy of speed;
 * Awtsmoos.com lets one finite token distinguish fresh garments while canonical modules remain one.
 */

const MAX_EVENTS = 96;
const events = [];
let sequence = 0;
let releaseToken = null;

function mainScriptUrl() {
	const script = [...document.scripts].find(element => {
		if (element.type !== "module" || !element.src) return false;
		return new URL(element.src, location.href).pathname.endsWith("/apps/code/js/main.js");
	});
	return script ? new URL(script.src, location.href) : null;
}

/** Returns the stable token already attached to Code's main bootstrap URL. */
export function getCodeAssetVersion() {
	if (releaseToken) return releaseToken;
	const scriptVersion = mainScriptUrl()?.searchParams.get("v");
	const pageVersion = new URL(location.href).searchParams.get("v");
	releaseToken = scriptVersion || pageVersion || "development";
	return releaseToken;
}

/** Adds the current Code release token without disturbing existing query parameters. */
export function versionCodeAssetUrl(path) {
	const url = new URL(path, location.origin);
	url.searchParams.set("v", getCodeAssetVersion());
	return url.origin === location.origin ? `${url.pathname}${url.search}${url.hash}` : url.href;
}

function debugEnabled() {
	if (new URL(location.href).searchParams.get("debugAssets") === "1") return true;
	try {
		return localStorage.getItem("awtsmoosCodeAssetDebug") === "1";
	} catch (_error) {
		return false;
	}
}

function remember(event) {
	events.push(event);
	if (events.length > MAX_EVENTS) events.shift();
	globalThis.__awtsmoosCodeAssetLog = events;
	if (debugEnabled()) console.debug("B\"H asset", event);
}

/** Begins one bounded asset timing span. */
export function beginAssetSpan(kind, name, url = "") {
	const id = `awtsmoos-asset-${++sequence}`;
	const startedAt = performance.now();
	performance.mark(`${id}-start`);
	remember({ id, phase: "start", kind, name, url, version: getCodeAssetVersion(), startedAt });
	return { id, kind, name, url, startedAt };
}

/** Finishes a span and records its elapsed time without throwing if marks are unavailable. */
export function endAssetSpan(span, status = "ready") {
	const endedAt = performance.now();
	try {
		performance.mark(`${span.id}-end`);
		performance.measure(span.id, `${span.id}-start`, `${span.id}-end`);
	} catch (_error) {
		// Timing evidence is optional; feature loading must never depend on it.
	}
	remember({ ...span, phase: status, endedAt, duration: endedAt - span.startedAt });
}

/** Returns a safe snapshot for diagnostics and tests. */
export function getAssetEvents() {
	return events.map(event => ({ ...event }));
}
