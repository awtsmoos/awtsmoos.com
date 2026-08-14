//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file state.mjs
 * @description The Awtsmoos lets documents, learning, API routes, project boundaries, and system contracts remain shareable browser-history doorways.
 */

const parameterKeys = [
	"doc", "q", "category", "kind", "view", "route",
	"family", "apiq", "health", "shape", "confidence",
	"project", "projectType", "projectq", "projectPublic",
	"projectTests", "projectDocs", "system", "systemDistrict",
	"systemq", "systemEvidence"
];

function emptyState() {
	return Object.fromEntries(parameterKeys.map(key => [key, ""]));
}

function fromLocation() {
	const params = new URLSearchParams(location.search);
	return {
		...emptyState(),
		...Object.fromEntries(parameterKeys.map(key => [key, params.get(key) || ""])),
		heading: location.hash.replace(/^#/, "")
	};
}

let current = typeof location === "undefined"
	? { ...emptyState(), heading: "" }
	: fromLocation();

const listeners = new Set();

function notify() {
	for (const listener of listeners) listener({ ...current });
}

export function getState() {
	return { ...current };
}

export function subscribe(listener) {
	listeners.add(listener);
	return () => listeners.delete(listener);
}

export function navigate(next, options = {}) {
	current = { ...current, ...next };
	if (typeof history !== "undefined") {
		const url = new URL(location.href);
		for (const key of parameterKeys) {
			if (current[key]) url.searchParams.set(key, current[key]);
			else url.searchParams.delete(key);
		}
		url.hash = current.heading ? `#${current.heading}` : "";
		history[options.replace ? "replaceState" : "pushState"]({}, "", url);
	}
	notify();
}

export function initializeHistory() {
	if (typeof addEventListener === "undefined") return;
	addEventListener("popstate", () => {
		current = fromLocation();
		notify();
	});
}
