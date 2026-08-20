//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BrowserNavigationCoordinator
 * @description The Awtsmoos unites Merkava, live Chromium, and safe HTTP fallback in one gate;
 * Awtsmoos.com gives one toolbar one authority so clicks never split into competing fate.
 */

import { clearRemoteJar } from "./proxyClient.js";
import { createInteractiveBrowserController } from "./interactiveController.js";
import { createRemoteNavigationController } from "./remoteNavigationController.js";

export function createBrowserNavigationCoordinator(options) {
	const remote = options.remoteSurface;
	remote.alias.value = options.aliasId || "";
	remote.jar.value = options.jarId || "default";
	const fallback = createRemoteNavigationController(options.fallbackOptions);
	fallback.destroy();
	const interactive = createInteractiveBrowserController({
		aliasId: () => remote.alias.value.trim(),
		jarId: () => remote.jar.value.trim() || "default",
		browserSurface: options.browserSurface,
		os: options.os,
		setAddress: value => options.browserSurface.address.value = value,
		setStatus: value => remote.status.textContent = value
	});
	const listeners = [];
	bind(remote.go, "click", () => navigate(options.browserSurface.address.value));
	bind(remote.back, "click", () => history("back"));
	bind(remote.forward, "click", () => history("forward"));
	bind(remote.reload, "click", () => history("reload"));
	bind(remote.clearJar, "click", clearJar);
	bind(options.browserSurface.address, "keydown", event => {
		if (event.key === "Enter") navigate(options.browserSurface.address.value).catch(() => {});
	});
	attachChild(options.content).catch(showError);
	return { destroy, interactive, navigate };

	async function navigate(value) {
		if (!remote.alias.value.trim()) {
			options.renderLocal();
			return null;
		}
		remote.status.textContent = `Opening ${value}…`;
		try {
			const result = await interactive.navigate(value);
			remote.status.textContent = "Interactive Chromium connected";
			return result;
		} catch (error) {
			if (!interactive.active() && isUnavailable(error)) {
				remote.status.textContent = "Interactive engine unavailable · using safe HTML fallback";
				return fallback.navigate(value);
			}
			showError(error);
			throw error;
		}
	}

	async function history(direction) {
		if (interactive.active()) return interactive.history(direction);
		if (direction === "back") return fallback.back();
		if (direction === "forward") return fallback.forward();
		return fallback.reload();
	}

	async function clearJar() {
		try {
			const interactiveResult = await interactive.clearCookies();
			const fallbackResult = await clearRemoteJar(
				remote.alias.value,
				remote.jar.value || "default"
			);
			const cleared = Boolean(interactiveResult.cleared || fallbackResult.cleared);
			remote.status.textContent = cleared ? "Browser cookies cleared" : "Browser cookie jars already empty";
			return { cleared };
		} catch (error) {
			showError(error);
			throw error;
		}
	}

	async function attachChild(content) {
		if (!content?.interactiveSessionId || !content?.interactiveTargetId) return;
		remote.alias.value = content.interactiveAliasId || remote.alias.value;
		remote.jar.value = content.interactiveJarId || remote.jar.value || "default";
		await interactive.attachExisting({
			aliasId: remote.alias.value,
			jarId: remote.jar.value,
			sessionId: content.interactiveSessionId,
			targetId: content.interactiveTargetId
		});
	}

	function bind(target, type, handler) {
		target.addEventListener(type, handler);
		listeners.push([target, type, handler]);
	}

	function destroy() {
		interactive.destroy();
		for (const [target, type, handler] of listeners) target.removeEventListener(type, handler);
	}

	function showError(error) {
		remote.status.textContent = error?.code || error?.message || "Browser navigation failed";
	}
}

function isUnavailable(error) {
	return error?.status === 503 || [
		"INTERACTIVE_BROWSER_UNAVAILABLE",
		"INTERACTIVE_BROWSER_EXITED",
		"INTERACTIVE_BROWSER_STARTUP_TIMEOUT"
	].includes(error?.code);
}
