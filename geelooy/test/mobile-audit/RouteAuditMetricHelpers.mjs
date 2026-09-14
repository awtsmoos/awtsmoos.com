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
	function isVisible(element) {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return style.display !== "none"
			&& style.visibility !== "hidden"
			&& Number(style.opacity) > .01
			&& rect.width > 0
			&& rect.height > 0;
	}

	function isInteractive(element) {
		return element.matches('button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="menuitem"],a[class]');
	}

	function isFocusRevealLink(element) {
		if (!element.matches('a[href]')) return false;
		const name = `${element.id} ${element.className}`;
		return /(^|[-_\s])skip([-_\s]|$)/i.test(name);
	}

	function isCssRemovedFromTabOrder(element) {
		for (let current = element; current; current = current.parentElement) {
			const style = getComputedStyle(current);
			if (current.hidden || current.inert) return true;
			if (style.display === "none" || style.visibility === "hidden") return true;
		}
		return false;
	}

	function isOverlay(element) {
		const style = getComputedStyle(element);
		if (style.position === "fixed") return true;
		if (!/^(absolute|sticky)$/.test(style.position)) return false;
		const name = `${element.id} ${element.className}`;
		return /menu|sheet|drawer|dialog|popover|dropdown|toast|overlay/i.test(name);
	}

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

	function isInsideIntentionallyClosedSurface(element, viewportWidth) {
		for (let current = element; current; current = current.parentElement) {
			if (isIntentionallyClosedSurface(current, viewportWidth)) {
				return true;
			}
		}
		return false;
	}

	function hasIntentionalHorizontalScroller(element) {
		for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
			const style = getComputedStyle(ancestor);
			if (/(auto|scroll)/.test(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 2) return true;
		}
		return false;
	}

	function usesBrowserDefaultTimes(fontFamily) {
		return /^(["']?times(?: new roman)?["']?)(,|$)/i.test(String(fontFamily || "").trim());
	}

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
