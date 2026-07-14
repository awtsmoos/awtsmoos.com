// B"H
// Boruch Hashem
// Blessed is He

import { normalizeAgentAddress, resolveRoute } from "./address.js";

/**
 * B"H
 *
 * Navigation is a transaction: validate first, preserve the old page, load the
 * new route, and resolve only after a bounded frame witness. The Awtsmoos renews
 * address and document together; Awtsmoos.com never destroys truth for a blank URL.
 */
export async function navigateRuntime(runtime, nextUrl, options = {}) {
	const previousUrl = runtime.state.currentUrl;
	const strict = options.strict === true;
	const normalized = strict
		? normalizeAgentAddress(nextUrl, previousUrl)
		: resolveRoute(nextUrl, { baseUrl: previousUrl }).url;
	const route = resolveRoute(normalized, {
		baseUrl: previousUrl,
		strict
	});
	if (options.addHistory !== false && previousUrl && previousUrl !== route.url) {
		runtime.state.history.push(previousUrl);
	}
	runtime.state.currentUrl = route.url;
	try {
		await loadRoute(runtime, route, options.timeoutMs);
		runtime.save();
		return {
			ok: true,
			url: route.url,
			tabId: runtime.id,
			title: safeTitle(runtime.frame)
		};
	} catch (error) {
		runtime.state.currentUrl = previousUrl;
		if (runtime.address) runtime.address.value = previousUrl;
		throw error;
	}
}

export async function loadCurrent(runtime, timeoutMs = 6000) {
	const route = resolveRoute(runtime.state.currentUrl);
	return loadRoute(runtime, route, timeoutMs);
}

export async function loadRoute(runtime, route, timeoutMs = 6000) {
	if (runtime.address) runtime.address.value = route.url;
	const witness = waitForFrame(runtime.frame, timeoutMs);
	if (route.type === "url") {
		runtime.frame.removeAttribute("srcdoc");
		runtime.frame.src = route.url;
	} else {
		runtime.frame.removeAttribute("src");
		runtime.frame.srcdoc = route.html;
	}
	const result = await witness;
	runtime.state.lastNavigationAt = new Date().toISOString();
	runtime.state.lastNavigationError = "";
	return result;
}

export function waitForFrame(frame, timeoutMs = 6000) {
	return new Promise((resolve, reject) => {
		let settled = false;
		const timer = setTimeout(() => finish(false, "browser_navigation_timeout"), timeoutMs);
		function finish(ok, error = "") {
			if (settled) return;
			settled = true;
			clearTimeout(timer);
			frame.removeEventListener?.("load", onLoad);
			frame.removeEventListener?.("error", onError);
			if (ok) resolve({ ok: true });
			else reject(new Error(error));
		}
		const onLoad = () => finish(true);
		const onError = () => finish(false, "browser_navigation_failed");
		frame.addEventListener?.("load", onLoad, { once: true });
		frame.addEventListener?.("error", onError, { once: true });
	});
}

export function backRuntime(runtime) {
	const previous = runtime.state.history.pop();
	if (!previous) return Promise.resolve({ ok: false, error: "browser_history_empty" });
	return navigateRuntime(runtime, previous, {
		addHistory: false
	});
}

function safeTitle(frame) {
	try {
		return frame.contentDocument?.title || "";
	} catch {
		return "";
	}
}
