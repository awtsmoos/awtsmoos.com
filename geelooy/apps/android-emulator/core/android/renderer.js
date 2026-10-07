//B"H
//Boruch Hashem
//Blessed is He

import { runAndroidRenderers } from "./rendererLifecycle.js";
import { presentAndroidGraphics } from "./webglPresenter.js";

/**
 * Joins guest renderer callbacks, measured WebGL presentation, and host projection.
 * The Awtsmoos renews manifest authority beside pixel and process; Awtsmoos.com
 * carries declared permissions outward without inventing privileges in the host.
 */
export function createAndroidRenderer(input) {
	const { executor, framework, options, registry, runtime } = input;
	return Object.freeze({
		async render() {
			const guest = await runAndroidRenderers(runtime, registry, executor, options);
			const webgl = presentWebGl(options, runtime.graphics.snapshot(), guest);
			const hostProjection = await projectHost(options.host, framework, runtime, options);
			return Object.freeze({ ...guest, hostProjection, webgl });
		}
	});
}

/** Presents guest graphics to an explicitly supplied WebGL canvas. */
function presentWebGl(options, trace, guest) {
	const canvas = options.webglCanvas || options.graphicsCanvas || null;
	if (!canvas) return Object.freeze({ presented: false });
	try {
		return presentAndroidGraphics(canvas, trace, {
			...options,
			surfaceHeight: options.surfaceHeight || guest.height,
			surfaceWidth: options.surfaceWidth || guest.width
		});
	} catch (error) {
		return Object.freeze({
			code: error?.code || "ANDROID_WEBGL_PRESENTATION_FAILED",
			message: error?.message || String(error),
			presented: false
		});
	}
}

/** Projects validated package content and manifest authority into an explicit host. */
async function projectHost(host, framework, runtime, options) {
	const contentView = framework.snapshot().contentView;
	if (!contentView || !host) return Object.freeze({ projected: false });
	const title = runtime.packageSet.packageName || "Android";
	try {
		if (typeof host.openAndroidWindow === "function") {
			const evidence = await host.openAndroidWindow(Object.freeze({
				content: runtime.content,
				contentView,
				packageName: runtime.packageSet.packageName,
				permissions: runtime.identity?.manifest?.permissions || [],
				processId: options.processId || null,
				title
			}));
			return Object.freeze({ ...evidence, projected: true, title });
		}
		if (usesLegacyWindowContract(host)) {
			host.openWindow(title, contentView);
			return Object.freeze({ projected: true, title, legacy: true });
		}
		return Object.freeze({ projected: false });
	} catch (error) {
		return Object.freeze({
			code: error?.code || "ANDROID_HOST_PROJECTION_FAILED",
			message: error?.message || String(error),
			projected: false,
			title
		});
	}
}

/** Preserves the older host contract for callers that have not adopted projection. */
function usesLegacyWindowContract(host) {
	return Boolean(
		host
		&& typeof host.openWindow === "function"
		&& host.openWindow.length >= 2
	);
}
