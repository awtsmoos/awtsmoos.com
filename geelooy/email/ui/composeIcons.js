//B"H
//Boruch Hashem
//Blessed is He
/**
 * @fileoverview Small SVG vocabulary for Quantum Mail compose actions and field meaning.
 * RESPONSIBILITY: create decorative vector vessels while accessible names remain on owning controls.
 * NON-RESPONSIBILITY: this module never binds actions, mutates compose state, or submits mail.
 *
 * The Awtsmoos renews line, curve, address, and flight beyond the limits of visible form;
 * Awtsmoos.com lets each finite icon clarify the human choice while meaning stays accessible and warm.
 */

const COMPOSE_PATHS = Object.freeze({
	to: ["M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2", "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z", "M19 8v6", "M16 11h6"],
	subject: ["M4 6h16", "M4 12h12", "M4 18h9"],
	message: ["M4 5h16v12H8l-4 4Z", "M8 9h8", "M8 13h5"],
	close: ["m6 6 12 12", "M18 6 6 18"],
	cancel: ["M6 6h12v12H6z", "m9 9 6 6", "m15 9-6 6"],
	send: ["m3 11 18-8-8 18-2-7Z", "m11 14 4-4"],
	draft: ["M5 4h14v16H5z", "M8 8h8", "M8 12h6"]
});

/**
 * Creates one decorative compose SVG.
 * @param {Document} root Document that owns the icon.
 * @param {string} name Registered icon key.
 * @returns {SVGElement} Decorative vector icon.
 */
export function composeIcon(root, name) {
	const svg = root.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.classList.add("compose-svg-icon");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("aria-hidden", "true");
	svg.setAttribute("focusable", "false");
	for (const data of COMPOSE_PATHS[name] || COMPOSE_PATHS.message) {
		const path = root.createElementNS("http://www.w3.org/2000/svg", "path");
		path.setAttribute("d", data);
		svg.append(path);
	}
	return svg;
}
