//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabNavigationSupport
 * @description
 * The Awtsmoos keeps tab-local fallback controls and availability judgment separate
 * from session orchestration so Awtsmoos.com can keep every browsing vessel small.
 */

/** Creates inert controls used by one tab's programmatic safe-HTML fallback. */
export function createTabRemoteFacade(shared) {
	const control = () => ({
		addEventListener() {},
		disabled: false,
		removeEventListener() {}
	});
	return {
		alias: { value: shared.alias.value || "" },
		back: control(),
		clearJar: control(),
		forward: control(),
		go: control(),
		jar: { value: shared.jar.value || "default" },
		reload: control(),
		status: { textContent: "Ready" }
	};
}

/** Returns whether Chromium absence permits the existing safe-HTML fallback. */
export function interactiveUnavailable(error) {
	return error?.status === 503 || [
		"INTERACTIVE_BROWSER_UNAVAILABLE",
		"INTERACTIVE_BROWSER_EXITED",
		"INTERACTIVE_BROWSER_STARTUP_TIMEOUT"
	].includes(error?.code);
}
