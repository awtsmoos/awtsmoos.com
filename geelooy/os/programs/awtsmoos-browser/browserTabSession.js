//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module BrowserTabSession
 * @description
 * The Awtsmoos grants each tab its own Chromium target and fallback history while
 * Awtsmoos.com lets only the revealed tab spend polling, input, and rendering effort.
 */

import { createInteractiveBrowserController } from "./interactiveController.js";
import { createBrowserTabFallback } from "./browserTabFallback.js";
import { interactiveUnavailable } from "./browserTabNavigationSupport.js";
import { titleFromAddress } from "./browserTabState.js";

/** Creates one independent browsing lifetime behind a shared host toolbar. */
export function createBrowserTabSession(options) {
	let mode = options.tab.mode || "blank";
	const fallback = createBrowserTabFallback({
		fallbackOptions: options.fallbackOptions,
		remoteSurface: options.remoteSurface,
		render: options.renderFallback,
		tab: options.tab
	});
	const interactive = createInteractiveBrowserController({
		aliasId: () => options.remoteSurface.alias.value.trim(),
		browserSurface: options.browserSurface,
		engineMode: options.engineMode,
		jarId: () => options.remoteSurface.jar.value.trim() || "default",
		os: options.os,
		setAddress: value => changed({ address: value, mode: "interactive" }),
		setStatus: status => changed({ status })
	});
	interactive.pause();
	return {
		attachExisting,
		clearCookies: () => interactive.clearCookies(),
		destroy,
		history,
		interactive,
		navigate,
		pause,
		resume
	};

	async function navigate(value, behavior = {}) {
		fallback.syncIdentity();
		fallback.address.value = value;
		changed({ address: value, status: `Opening ${value}…` });
		try {
			const result = await interactive.navigate(value, behavior);
			mode = "interactive";
			options.renderFallback("");
			changed({ mode, status: "Interactive Chromium connected" });
			return result;
		} catch (error) {
			if (interactive.active() || !interactiveUnavailable(error)) throw error;
			mode = "fallback";
			const result = await fallback.navigate(value);
			changed({
				address: fallback.address.value,
				mode,
				status: fallback.remote.status.textContent
			});
			return result;
		}
	}

	async function history(direction) {
		if (interactive.active()) return interactive.history(direction);
		const result = await fallback.history(direction);
		changed({
			address: fallback.address.value,
			status: fallback.remote.status.textContent
		});
		return result;
	}

	async function attachExisting(content) {
		fallback.syncIdentity(content);
		mode = "interactive";
		await interactive.attachExisting({
			aliasId: options.remoteSurface.alias.value,
			engineMode: content.interactiveEngineMode || options.engineMode(),
			jarId: options.remoteSurface.jar.value,
			sessionId: content.interactiveSessionId,
			targetId: content.interactiveTargetId
		});
		options.renderFallback("");
		changed({ mode, status: "Interactive Chromium connected" });
	}

	function pause() {
		fallback.pause();
		interactive.pause();
	}

	function resume() {
		if (interactive.active()) {
			options.renderFallback("");
			interactive.resume();
		} else if (mode === "fallback") fallback.resume();
		else options.renderFallback("");
	}

	function destroy() {
		fallback.destroy();
		interactive.destroy();
	}

	function changed(patch) {
		if (patch.address) patch.title = titleFromAddress(patch.address);
		options.onChange(patch);
	}
}
