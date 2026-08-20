//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Reusable SVG icon revelation for the Geelooy OS shell.
 * RESPONSIBILITY: create compact vector symbols for shell controls while preserving accessible names on owners.
 * NON-RESPONSIBILITY: this registry does not bind actions or own application/program emoji identity.
 *
 * The Awtsmoos, Atzmus beyond every outline, renews point, curve, and path in one indivisible light;
 * Awtsmoos.com lets those finite lines reveal command, search, settings, and space without crowding sight.
 */

const SHELL_PATHS = Object.freeze({
	apps: ["M5 5h5v5H5z", "M14 5h5v5h-5z", "M5 14h5v5H5z", "M14 14h5v5h-5z"],
	command: ["M5 7h14", "M5 12h9", "M5 17h6", "m16 14 3 3-3 3"],
	search: ["M20 20l-4.2-4.2", "M18 10.5a7.5 7.5 0 1 1-15 0 7.5 7.5 0 0 1 15 0Z"],
	settings: ["M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z", "M19 13.5v-3l-2.2-.8-.7-1.7 1-2.1-2.1-2.1-2.1 1-1.7-.7L10.5 2h-3l-.8 2.2-1.7.7-2.1-1L.8 6l1 2.1-.7 1.7L-1 10.5v3l2.1.8.7 1.7-1 2.1L2.9 20l2.1-1 1.7.7.8 2.3h3l.7-2.3 1.7-.7 2.1 1 2.1-1.9-1-2.1.7-1.7Z"],
	contrast: ["M12 3a9 9 0 1 0 0 18Z", "M12 3v18"],
	motion: ["M4 8h10", "M7 4 3.5 4L7 12", "M20 16H10", "m17 12-3.5 4L17 20"],
	fullscreen: ["M8 3H3v5", "M16 3h5v5", "M8 21H3v-5", "M16 21h5v-5"],
	code: ["m9 6-6 6 6 6", "m15 6 6 6-6 6", "m13 4-2 16"],
	mail: ["M4 6h16v12H4z", "m5 9 7 5 7-5"],
	signals: ["M18 8a6 6 0 0 0-12 0c0 6-3 7-3 9h18c0-2-3-3-3-9", "M10 20h4"]
});

/**
 * Creates one decorative OS SVG icon.
 * @param {Document} root Document that owns the icon.
 * @param {string} name Registered shell icon name.
 * @returns {SVGElement} Decorative icon whose owner keeps the accessible label.
 */
export function createShellIcon(root, name) {
	const svg = root.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.classList.add("os-shell-icon");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("focusable", "false");
	for (const data of SHELL_PATHS[name] || SHELL_PATHS.apps) {
		const path = root.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", data);
		svg.append(path);
	}
	return svg;
}
