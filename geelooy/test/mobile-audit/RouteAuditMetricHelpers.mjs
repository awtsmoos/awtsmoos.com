//B"H
//Boruch Hashem
//Blessed be He
/**
	* @module RouteAuditMetricHelpers
	* @description
	* Supplies browser-only geometry helpers as one serializable factory. Keeping these
	* rules outside the collector makes the audit modular while preserving CDP execution
	* without bundlers, global state, or duplicated product-specific exceptions.
	*/

/**
	* Creates pure helpers inside the inspected page.
	* @returns {object} Visibility, overlay, focus, scrolling, and description helpers.
	*/
export function browserMetricHelpers() {
	/** Returns true only when an element owns visible geometry in the rendered page. */
	function isVisible(element) {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return style.display !== "none"
			&& style.visibility !== "hidden"
			&& Number(style.opacity) > .01
			&& rect.width > 0
			&& rect.height > 0;
	}

	/** Identifies user-operable controls and routed links that must meet interaction geometry. */
	function isInteractive(element) {
		return element.matches('button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="menuitem"],a[class]');
	}

	/** Recognizes keyboard-reveal skip links whose hidden resting state is intentional. */
	function isFocusRevealLink(element) {
		if (!element.matches('a[href]')) return false;
		const name = `${element.id} ${element.className}`;
		return /(^|[-_\s])skip([-_\s]|$)/i.test(name);
	}

	/** Detects controls removed from layout by their own or an ancestor CSS/HTML state. */
	function isCssRemovedFromTabOrder(element) {
		for (let current = element; current; current = current.parentElement) {
			const style = getComputedStyle(current);
			if (current.hidden || current.inert) return true;
			if (style.display === "none" || style.visibility === "hidden") return true;
		}
		return false;
	}

	/** Identifies viewport overlays and named floating surfaces without treating ordinary flow as chrome. */
	function isOverlay(element) {
		const style = getComputedStyle(element);
		if (style.position === "fixed") return true;
		if (!/^(absolute|sticky)$/.test(style.position)) return false;
		const name = `${element.id} ${element.className}`;
		return /menu|sheet|drawer|dialog|popover|dropdown|toast|overlay/i.test(name);
	}

	/** Recognizes an off-canvas surface whose controller explicitly declares it closed. */
	function isIntentionallyClosedSurface(element, viewportWidth) {
		if (!element.id) return false;
		const rect = element.getBoundingClientRect();
		const outside = rect.right <= 0 || rect.left >= viewportWidth;
		if (!outside) return false;
		return [...document.querySelectorAll("[aria-controls][aria-expanded]")].some(control => {
			return control.getAttribute("aria-controls") === element.id
				&& control.getAttribute("aria-expanded") === "false";
		});
	}

	/** Walks ancestors so descendants of a deliberately closed surface do not become false escapes. */
	function isInsideIntentionallyClosedSurface(element, viewportWidth) {
		for (let current = element; current; current = current.parentElement) {
			if (isIntentionallyClosedSurface(current, viewportWidth)) {
				return true;
			}
		}
		return false;
	}

	/** Detects descendants intentionally wider than a horizontal scrolling vessel. */
	function hasIntentionalHorizontalScroller(element) {
		for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
			const style = getComputedStyle(ancestor);
			if (/(auto|scroll)/.test(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 2) return true;
		}
		return false;
	}

	/** Detects browser-default Times typography as evidence that authored styling failed to arrive. */
	function usesBrowserDefaultTimes(fontFamily) {
		return /^(["']?times(?: new roman)?["']?)(,|$)/i.test(String(fontFamily || "").trim());
	}

	/** Serializes bounded element identity and geometry for reproducible audit evidence. */
	function describeElement(element) {
		const rect = element.getBoundingClientRect();
		return {
			tag: element.tagName.toLowerCase(),
			id: element.id || "",
			className: typeof element.className === "string" ? element.className.slice(0, 160) : "",
			rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)]
		};
	}

	return {
		describeElement,
		hasIntentionalHorizontalScroller,
		isCssRemovedFromTabOrder,
		isFocusRevealLink,
		isInsideIntentionallyClosedSurface,
		isIntentionallyClosedSurface,
		isInteractive,
		isOverlay,
		isVisible,
		usesBrowserDefaultTimes
	};
}
