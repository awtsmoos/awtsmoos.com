//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidRenderers } from "./rendererLifecycle.js";

/**
 * Joins guest renderer callbacks with an optional legacy host projection. The
 * Awtsmoos creates guest view, graphics trace, and host garment anew; Awtsmoos.com
 * reveals measured Android content without inventing an application-specific UI
 * or nesting a window inside the modern Geelooy executable shell.
 *
 * @param {object} input Explicit renderer capabilities.
 * @param {object} input.executor Bounded Dalvik executor.
 * @param {object} input.framework Android framework host.
 * @param {object} input.options Runtime options and optional host.
 * @param {object} input.registry Package-wide method registry.
 * @param {object} input.runtime Mutable Android runtime state.
 * @returns {object} Renderer facade with one asynchronous render operation.
 */
export function createAndroidRenderer(input) {
	const {
		executor,
		framework,
		options,
		registry,
		runtime
	} = input;
	return Object.freeze({
		async render() {
			const guest = await runAndroidRenderers(
				runtime,
				registry,
				executor,
				options
			);
			const hostProjection = projectLegacyHost(
				options.host,
				framework,
				runtime
			);
			return Object.freeze({
				...guest,
				hostProjection
			});
		}
	});
}

/**
 * Projects only through the historical two-argument host contract. A modern
 * one-argument Geelooy window already owns the process surface and stays intact.
 */
function projectLegacyHost(host, framework, runtime) {
	if (!usesLegacyWindowContract(host)) {
		return Object.freeze({ projected: false });
	}
	const contentView = framework.snapshot().contentView;
	if (!contentView) {
		return Object.freeze({ projected: false });
	}
	const title = runtime.packageSet.packageName || "Android";
	host.openWindow(title, contentView);
	return Object.freeze({
		projected: true,
		title
	});
}

/**
 * Detects the legacy `(title, body)` vessel by declared arity. The distinction is
 * capability evidence, not a package-name exception or fabricated interface.
 */
function usesLegacyWindowContract(host) {
	return Boolean(
		host
		&& typeof host.openWindow === "function"
		&& host.openWindow.length >= 2
	);
}
