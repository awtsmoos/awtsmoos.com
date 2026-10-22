//B"H
//Boruch Hashem
//Blessed is He

/**
 * @fileoverview Loads optional Code styles only when their feature manifests.
 * The Awtsmoos contains every garment without forcing every garment into first paint;
 * Awtsmoos.com lets each feature receive its CSS exactly when its visible vessel awakens.
 */

const GROUPS = Object.freeze({
	search: ["/apps/code/css/search.css"],
	"tab-manager": ["/apps/code/css/tab-manager.css", "/apps/code/css/tab-manager-lifecycle.css"],
	"file-commander": [
		"/apps/code/css/file-commander/layout.css",
		"/apps/code/css/file-commander/grid.css",
		"/apps/code/css/file-commander/details.css"
	],
	vibe: ["/apps/code/css/vibe/main.css", "/apps/code/css/vibe/chat-vessels.css"],
	ai: ["/apps/code/css/ai-studio.css"],
	civilization: [
		"/apps/code/css/civilization/tokens.css",
		"/apps/code/css/civilization/hud.css",
		"/apps/code/css/civilization/event-rain.css",
		"/apps/code/css/civilization/cockpit.css",
		"/apps/code/css/civilization/launcher.css"
	],
	account: ["/apps/code/css/session/account-panel.css"],
	onboarding: ["/apps/code/css/onboarding.css"],
	"tunnel-console": ["/apps/code/css/tunnel-console.css"],
	visuals: ["/apps/code/css/effects.css", "/apps/code/css/visuals.css"],
	terminal: ["/apps/code/css/views/tools.css", "/apps/code/css/views/terminal.css"],
	git: ["/apps/code/css/views/git.css"],
	browser: ["/apps/code/css/views/tools.css", "/apps/code/css/views/browser.css"],
	"virtual-os": ["/apps/code/css/views/virtual-os.css"],
	android: ["/apps/code/css/views/android-emulator.css"],
	zip: ["/apps/code/css/zip-explorer.css"]
});

const TOKENS = Object.freeze([
	["file-commander", "file-commander"], ["tab-manager", "tab-manager"],
	["tunnel-console", "tunnel-console"], ["civilization", "civilization"],
	["virtual-os", "virtual-os"], ["android", "android"], ["terminal", "terminal"],
	["browser", "browser"], ["git", "git"], ["zip", "zip"], ["vibe", "vibe"],
	["ai-studio", "ai"], ["account", "account"], ["onboarding", "onboarding"],
	["search", "search"]
]);

const stylePromises = new Map();

/** Loads one stylesheet exactly once and resolves only when CSSOM is ready. */
function loadStyle(href) {
	if (stylePromises.has(href)) return stylePromises.get(href);
	const promise = new Promise((resolve, reject) => {
		const existing = [...document.styleSheets].find(sheet => sheet.href?.includes(href));
		if (existing) return resolve(existing.ownerNode);
		const link = document.createElement("link");
		link.rel = "stylesheet";
		link.href = href;
		link.dataset.awtsmoosFeatureStyle = href;
		link.addEventListener("load", () => resolve(link), { once: true });
		link.addEventListener("error", () => reject(new Error(`Failed to load ${href}`)), { once: true });
		document.head.appendChild(link);
	});
	stylePromises.set(href, promise);
	return promise;
}

/** Loads one or more named feature style groups. */
export async function ensureFeatureStyles(...names) {
	const paths = [...new Set(names.flatMap(name => GROUPS[name] || []))];
	await Promise.all(paths.map(loadStyle));
}

function signature(element) {
	return `${element.id || ""} ${element.className || ""} ${element.getAttribute("data-view") || ""} ${element.getAttribute("data-tool") || ""}`.toLowerCase();
}

function visibleCandidate(element) {
	return !element.hidden && !element.classList.contains("hidden") && element.getAttribute("aria-hidden") !== "true";
}

async function prepareElement(element) {
	if (!(element instanceof HTMLElement) || !visibleCandidate(element)) return;
	const text = signature(element);
	const groups = TOKENS.filter(([token]) => text.includes(token)).map(([, group]) => group);
	if (!groups.length) return;
	element.dataset.awtsmoosStylePending = "true";
	try {
		await ensureFeatureStyles(...groups);
	} finally {
		delete element.dataset.awtsmoosStylePending;
	}
}

/** Watches newly shown feature roots so their CSS appears before the next useful paint. */
export function watchFeatureStyles() {
	const observer = new MutationObserver(records => {
		for (const record of records) {
			if (record.target instanceof HTMLElement) void prepareElement(record.target);
			for (const node of record.addedNodes) {
				if (node instanceof HTMLElement) {
					void prepareElement(node);
					node.querySelectorAll("[id], [class]").forEach(child => void prepareElement(child));
				}
			}
		}
	});
	observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["class", "hidden", "aria-hidden"] });
	return observer;
}
