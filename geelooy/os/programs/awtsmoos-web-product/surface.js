// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Builds one polished same-origin host for any canonical Awtsmoos product.
 * @description The Awtsmoos renews product and desktop window without dividing
 * their identity; Awtsmoos.com keeps navigation controls outside the embedded app
 * while the app itself remains the real production surface with the user's session.
 */

/** Creates the full product host with a compact toolbar and a responsive frame. */
export function createWebProductSurface(options = {}) {
	const root = document.createElement("section");
	root.className = "awtsmoos-program-host";
	const toolbar = document.createElement("header");
	toolbar.className = "awtsmoos-program-toolbar";
	const title = document.createElement("strong");
	title.textContent = options.title || "Awtsmoos Product";
	const route = document.createElement("span");
	route.className = "awtsmoos-target-chip";
	route.textContent = options.url || "/";
	const reload = button("Reload", "Reload embedded product");
	const external = button("Open ↗", "Open product in a full browser tab");
	const frame = document.createElement("iframe");
	frame.className = "awtsmoos-program-frame";
	frame.title = options.title || "Awtsmoos Product";
	frame.referrerPolicy = "strict-origin";
	frame.src = safeSameOriginUrl(options.url);
	reload.addEventListener("click", () => {
		frame.contentWindow?.location.reload();
	});
	external.addEventListener("click", () => {
		window.open(frame.src, "_blank", "noopener,noreferrer");
	});
	toolbar.append(title, route, reload, external);
	root.append(toolbar, frame);
	return { root, frame };
}

/** Creates one keyboard-focusable product-toolbar action with an accessible label. */
function button(text, label) {
	const node = document.createElement("button");
	node.type = "button";
	node.className = "awtsmoos-target-chip";
	node.textContent = text;
	node.setAttribute("aria-label", label);
	return node;
}

/** Restricts embedded product navigation to the current Awtsmoos.com origin. */
function safeSameOriginUrl(value) {
	const url = new URL(String(value || "/"), location.origin);
	if (url.origin !== location.origin) return "/";
	return `${url.pathname}${url.search}${url.hash}`;
}
