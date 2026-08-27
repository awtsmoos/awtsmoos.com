// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalRendererSelection
 * @description
 * The Awtsmoos renews each possible manifestation while a finite client must choose one renderer at a time;
 * Awtsmoos.com makes precedence deterministic and explainable so extension never becomes invisible plugin crime.
 */

/**
 * @description Builds deterministic renderer lookup keys from most specific to most general.
 * @param {string} type - Namespaced resource type.
 * @param {string} [view="detail"] - Requested render mode.
 * @returns {string[]} Ordered renderer keys.
 */
export function portalRendererKeys(type, view = "detail") {
	const safeType = typeof type === "string" && type
		? type
		: "*";
	const safeView = typeof view === "string" && view
		? view
		: "detail";

	return [
		`${safeType}:${safeView}`,
		`${safeType}:*`,
		`*:${safeView}`,
		"*:*"
	];
}

/**
 * @description Selects the first registered renderer matching deterministic Portal precedence.
 * @param {Map<string,Function>} renderers - Renderer registry keyed by type/view selectors.
 * @param {string} type - Namespaced resource type.
 * @param {string} [view="detail"] - Requested render mode.
 * @returns {{renderer:Function|null,key:string|null,reason:string}} Selection result with diagnostics.
 */
export function selectPortalRenderer(renderers, type, view = "detail") {
	for (const key of portalRendererKeys(type, view)) {
		const renderer = renderers.get(key);
		if (typeof renderer === "function") {
			return {
				renderer,
				key,
				reason: key === `${type}:${view}`
					? "exact-type-view"
					: key.endsWith(":*") && key.startsWith(`${type}:`)
						? "type-fallback"
						: key.startsWith("*:") && key !== "*:*"
							? "view-fallback"
							: "global-fallback"
			};
		}
	}

	return {
		renderer: null,
		key: null,
		reason: "unregistered"
	};
}
