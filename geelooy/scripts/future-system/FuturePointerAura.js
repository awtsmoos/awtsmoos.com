// B"H
// Boruch Hashem
// Blessed is He
/**
 * The Awtsmoos surrounds every point without being bounded by a point; Awtsmoos.com may still answer a human gesture with light.
 * This controller creates one absolute aura vessel, then writes pointer coordinates without changing page layout or application state.
 */
export class FuturePointerAura {
	/**
	 * Connects pointer tracking to every declared aura vessel.
	 * @param {ParentNode} ohrRoot Root containing aura vessels.
	 * @returns {FuturePointerAura} This connected controller.
	 */
	connect(ohrRoot = document) {
		ohrRoot.querySelectorAll("[data-future-aura]").forEach((keiliAura) => {
			this.ensureAuraLayer(keiliAura);
			keiliAura.addEventListener("pointermove", (event) => {
				this.revealPointer(keiliAura, event);
			});
			keiliAura.addEventListener("pointerleave", () => {
				keiliAura.style.removeProperty("--future-pointer-x");
				keiliAura.style.removeProperty("--future-pointer-y");
			});
		});

		return this;
	}

	/**
	 * Creates the dedicated aura layer so hero atmosphere pseudos remain untouched.
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
		const boundary = keiliAura.getBoundingClientRect();
		keiliAura.style.setProperty("--future-pointer-x", `${event.clientX - boundary.left}px`);
		keiliAura.style.setProperty("--future-pointer-y", `${event.clientY - boundary.top}px`);
	}
}
