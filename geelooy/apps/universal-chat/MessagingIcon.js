// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Draws one restrained line-icon language across the flagship navigation instead of mixing platform emoji.
 * @description The Awtsmoos is one before every symbol, while Awtsmoos.com gives each social chamber a small consistent mark of light;
 * paths remain decorative beside visible labels, so meaning never depends on color, emoji rendering, or icon recognition alone.
 */

const ICON_PATHS = Object.freeze({
	chat: ["M4 5.5h16v10H9l-5 4v-14Z", "M8 9h8", "M8 12h5"],
	groups: ["M8.5 12a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z", "M15.5 11a2.5 2.5 0 1 0 0-5", "M3.5 19c.4-3 2.1-4.5 5-4.5S13.2 16 13.5 19", "M14 14.8c3-.6 5.5.7 6 4.2"],
	requests: ["M12 3a5 5 0 0 0-5 5v2.5L5 14h14l-2-3.5V8a5 5 0 0 0-5-5Z", "M10 18h4"],
	friends: ["M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z", "M3 20c.4-4 2.4-6 6-6s5.6 2 6 6", "m16 8 1.5 1.5L21 6"],
	book: ["M4 5.5c3-1.2 5.7-.8 8 1.2v12c-2.3-2-5-2.4-8-1.2v-12Z", "M20 5.5c-3-1.2-5.7-.8-8 1.2v12c2.3-2 5-2.4 8-1.2v-12Z"],
	mail: ["M3 6h18v12H3V6Z", "m4 9 5.2 4a4.5 4.5 0 0 0 5.6 0L20 9"],
	activity: ["M12 21a9 9 0 1 0-9-9", "M3 5v7h7", "M12 7v5l3 2"],
	discover: ["m12 3 2.2 6.8L21 12l-6.8 2.2L12 21l-2.2-6.8L3 12l6.8-2.2L12 3Z"],
	online: ["M12 4a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z", "M12 8v4l3 2"],
	settings: ["M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z", "M19 12a7 7 0 0 0-.1-1l2-1.6-2-3.4-2.4 1a8 8 0 0 0-1.8-1L14.4 3h-4.8L9.3 6a8 8 0 0 0-1.8 1L5.1 6 3 9.4 5.1 11a7 7 0 0 0 0 2L3 14.6 5.1 18l2.4-1a8 8 0 0 0 1.8 1l.3 3h4.8l.3-3a8 8 0 0 0 1.8-1l2.4 1 2-3.4-2-1.6c.1-.3.1-.7.1-1Z"],
	inbox: ["M4 5h16v14H4V5Z", "M4 14h4l2 2h4l2-2h4"],
	arrow: ["m14 7-5 5 5 5"],
	plus: ["M12 5v14", "M5 12h14"],
	person: ["M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M4.5 21c.6-4 3-6 7.5-6s6.9 2 7.5 6"],
	more: ["M5 12h.01", "M12 12h.01", "M19 12h.01"],
	spark: ["m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"]
});

/** Creates a decorative SVG whose surrounding text or aria-label remains the accessible name. */
export function createMessagingIcon(name, className = "messaging-icon") {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("focusable", "false");
	svg.classList.add(className);
	for (const data of ICON_PATHS[name] || ICON_PATHS.spark) {
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", data);
		path.setAttribute("fill", "none");
		path.setAttribute("stroke", "currentColor");
		path.setAttribute("stroke-width", "1.7");
		path.setAttribute("stroke-linecap", "round");
		path.setAttribute("stroke-linejoin", "round");
		svg.appendChild(path);
	}
	return svg;
}
