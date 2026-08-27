// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module PortalNavigation
 * @description
 * The Awtsmoos renews every path while browser history gives finite users a trustworthy road;
 * Awtsmoos.com keeps Portal state addressable through URLs so back, refresh, sharing, and mobile navigation never become an SPA-mode load.
 */

const SECTIONS = new Set(["root", "types", "families", "family"]);
const VIEWS = new Set(["detail", "inspector"]);

/**
 * @description Parses the current Portal route from a URL using conservative defaults.
 * @param {URL|string} input - URL or URL string to inspect.
 * @returns {{section:string,id:string,view:string}} Normalized Portal route.
 */
export function parsePortalRoute(input) {
	const url = input instanceof URL
		? input
		: new URL(String(input), location.href);
	const requestedSection = url.searchParams.get("section") || "families";
	const requestedView = url.searchParams.get("view") || "detail";

	return {
		section: SECTIONS.has(requestedSection) ? requestedSection : "families",
		id: (url.searchParams.get("id") || "").slice(0, 512),
		view: VIEWS.has(requestedView) ? requestedView : "detail"
	};
}

/**
 * @description Builds a relative URL for one normalized Portal route.
 * @param {{section:string,id?:string,view?:string}} route - Portal route fields.
 * @returns {string} Relative URL including stable query-state parameters.
 */
export function portalRouteHref(route) {
	const url = new URL(location.href);
	url.search = "";
	url.searchParams.set("section", SECTIONS.has(route.section) ? route.section : "families");
	if (route.id) {
		url.searchParams.set("id", route.id);
	}
	if (route.view && route.view !== "detail") {
		url.searchParams.set("view", route.view);
	}

	return `${url.pathname}${url.search}`;
}

/**
 * @description Writes one Portal route into browser history without forcing a document reload.
 * @param {{section:string,id?:string,view?:string}} route - Route to publish.
 * @param {boolean} [replace=false] - Whether to replace instead of push history.
 * @returns {void}
 */
export function publishPortalRoute(route, replace = false) {
	const href = portalRouteHref(route);
	const method = replace ? "replaceState" : "pushState";
	window.history[method]({ portalRoute: route }, "", href);
}

/**
 * @description Subscribes to browser back/forward navigation and returns the current normalized route to the listener.
 * @param {(route:Object)=>void} listener - Navigation listener.
 * @returns {()=>void} Unsubscribe function.
 */
export function listenPortalNavigation(listener) {
	const handler = () => listener(parsePortalRoute(location.href));
	window.addEventListener("popstate", handler);

	return () => window.removeEventListener("popstate", handler);
}
