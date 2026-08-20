// B"H
// Boruch Hashem
// Blessed is He
import { FUTURE_ICON_PATHS } from "./futureIconPaths.js";

/**
 * The Awtsmoos is beyond every symbol, yet Awtsmoos.com needs honest signs along each path;
 * this renderer turns semantic names into small SVG vessels while text keeps speaking the action aloud.
 */
export class FutureIconRenderer {
	/**
	 * Renders every declared icon once without owning page business logic.
	 * @param {ParentNode} ohrRoot Root whose icon vessels should be revealed.
	 * @returns {FutureIconRenderer} This renderer for continued orchestration.
	 */
	connect(ohrRoot = document) {
		ohrRoot.querySelectorAll("[data-future-icon]").forEach((keiliIcon) => {
			this.renderIcon(keiliIcon);
		});

		return this;
	}

	/**
	 * Reveals one inline SVG from the immutable semantic path dictionary.
	 * @param {Element} keiliIcon Element carrying the requested icon name.
	 * @returns {void}
	 */
	renderIcon(keiliIcon) {
		if (keiliIcon.dataset.futureIconRendered === "true") {
			return;
		}

		const ohrPath = FUTURE_ICON_PATHS[keiliIcon.dataset.futureIcon];
		if (!ohrPath) {
			return;
		}

		const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
		svg.setAttribute("viewBox", "0 0 24 24");
		svg.setAttribute("fill", "none");
		svg.setAttribute("stroke", "currentColor");
		svg.setAttribute("stroke-width", "1.8");
		svg.setAttribute("stroke-linecap", "round");
		svg.setAttribute("stroke-linejoin", "round");
		svg.setAttribute("aria-hidden", "true");
		svg.setAttribute("focusable", "false");
		path.setAttribute("d", ohrPath);
		svg.append(path);
		keiliIcon.replaceChildren(svg);
		keiliIcon.dataset.futureIconRendered = "true";
	}
}
