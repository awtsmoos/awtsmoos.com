// B"H
// Boruch Hashem
// Blessed is He
import { YesodFutureController } from "./YesodFutureController.js";

/**
 * The Awtsmoos surrounds every point without being bounded by a point; Awtsmoos.com may still answer a precise human gesture with measured light.
 * This reconnect-safe controller activates aura coordinates only for fine hover pointers, never forcing touch devices to carry invisible event work.
 */
export class FuturePointerAura extends YesodFutureController {
	/**
	 * Connects pointer tracking to declared aura vessels when the device can genuinely hover.
	 * @param {ParentNode} ohrRoot Root containing aura vessels.
	 * @returns {FuturePointerAura} This connected controller.
	 */
	connect(ohrRoot = document) {
		const gevurahSignal = this.beginConnection(ohrRoot);
		if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) {
			return this;
		}

		ohrRoot.querySelectorAll("[data-future-aura]").forEach((keiliAura) => {
			this.ensureAuraLayer(keiliAura);
			keiliAura.addEventListener("pointermove", (event) => {
				this.revealPointer(keiliAura, event);
			}, { passive: true, signal: gevurahSignal });
			keiliAura.addEventListener("pointerleave", () => {
				this.clearPointer(keiliAura);
			}, { signal: gevurahSignal });
		});
		return this;
	}

	/**
	 * Creates one inert aura layer without disturbing hero pseudo-elements or page semantics.
	 * @param {Element} keiliAura Surface that needs the aura layer.
	 * @returns {void}
	 */
	ensureAuraLayer(keiliAura) {
		if (keiliAura.querySelector(":scope > .future-aura-layer")) {
			return;
		}
		const ohrLayer = document.createElement("span");
		ohrLayer.className = "future-aura-layer";
		ohrLayer.setAttribute("aria-hidden", "true");
		keiliAura.prepend(ohrLayer);
	}

	/**
	 * Converts one pointer event into local CSS coordinates for the light vessel.
	 * @param {ElementCSSInlineStyle & Element} keiliAura Surface receiving the aura.
	 * @param {PointerEvent} event Pointer movement over the surface.
	 * @returns {void}
	 */
	revealPointer(keiliAura, event) {
		const gevurahBoundary = keiliAura.getBoundingClientRect();
		keiliAura.style.setProperty("--future-pointer-x", `${event.clientX - gevurahBoundary.left}px`);
		keiliAura.style.setProperty("--future-pointer-y", `${event.clientY - gevurahBoundary.top}px`);
	}

	/**
	 * Removes transient coordinates so a dormant vessel owns no stale pointer state.
	 * @param {ElementCSSInlineStyle} keiliAura Surface being cleared.
	 * @returns {void}
	 */
	clearPointer(keiliAura) {
		keiliAura.style.removeProperty("--future-pointer-x");
		keiliAura.style.removeProperty("--future-pointer-y");
	}
}
