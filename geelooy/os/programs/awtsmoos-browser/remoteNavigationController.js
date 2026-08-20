//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module RemoteNavigationController
 * @description
 * The Awtsmoos carries public web testimony into the local Merkava renderer without
 * granting guest markup network authority. Awtsmoos.com keeps history, alias, jar,
 * and peruta evidence in host-owned controls that remote pages cannot counterfeit.
 */

import { clearRemoteJar, fetchRemotePage } from "./proxyClient.js";
import { createNavigationState } from "./navigationState.js";
import {
	createRemoteControlState,
	settleRemoteAction
} from "./remoteControlState.js";
import {
	errorStatus,
	normalizeRemoteUrl,
	successStatus
} from "./remoteNavigationPolicy.js";

export function createRemoteNavigationController(options) {
	const history = createNavigationState();
	const remote = options.remoteSurface;
	const browser = options.browserSurface;
	const fetchPage = options.fetchPage || fetchRemotePage;
	const clearJar = options.clearJar || clearRemoteJar;
	const controls = createRemoteControlState(remote, history);
	remote.alias.value = options.aliasId || "";
	remote.jar.value = options.jarId || "default";
	controls.bind(remote.go, "click", () => settleRemoteAction(navigate(browser.address.value)));
	controls.bind(remote.back, "click", () => settleRemoteAction(back()));
	controls.bind(remote.forward, "click", () => settleRemoteAction(forward()));
	controls.bind(remote.reload, "click", () => settleRemoteAction(reload()));
	controls.bind(remote.clearJar, "click", () => settleRemoteAction(clearCurrentJar()));
	controls.update();
	return { back, destroy: controls.destroy, forward, history, navigate, reload };

	async function navigate(value, record = true, initiatorUrl = history.current()) {
		const url = normalizeRemoteUrl(value);
		controls.setBusy(true, `Fetching ${url}`);
		try {
			const result = await fetchPage({
				aliasId: remote.alias.value,
				jarId: remote.jar.value || "default",
				projectId: options.projectId || null,
				initiatorUrl,
				url
			});
			const finalUrl = result.url || url;
			if (record) history.visit(finalUrl);
			browser.address.value = finalUrl;
			if (typeof result.text === "string") {
				browser.editor.value = result.text;
				options.render(result.text);
			}
			remote.status.textContent = successStatus(result);
			return result;
		} catch (error) {
			remote.status.textContent = errorStatus(error);
			throw error;
		} finally {
			controls.setBusy(false);
		}
	}

	async function back() {
		const initiatorUrl = history.current();
		const url = history.back();
		if (!url) return null;
		try {
			return await navigate(url, false, initiatorUrl);
		} catch (error) {
			history.forward();
			throw error;
		}
	}

	async function forward() {
		const initiatorUrl = history.current();
		const url = history.forward();
		if (!url) return null;
		try {
			return await navigate(url, false, initiatorUrl);
		} catch (error) {
			history.back();
			throw error;
		}
	}

	async function reload() {
		return navigate(history.reload() || browser.address.value, false);
	}

	async function clearCurrentJar() {
		const result = await clearJar(remote.alias.value, remote.jar.value || "default");
		remote.status.textContent = result.cleared
			? "Cookie jar cleared"
			: "Cookie jar already empty";
		return result;
	}
}
