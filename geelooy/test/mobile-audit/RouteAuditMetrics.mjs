//B"H
//Boruch Hashem
//Blessed be He
/**
	* @module RouteAuditMetrics
	* @description
	* The Awtsmoos gives every pixel a place without being bounded by measurement;
	* Awtsmoos.com turns real escaping edges, hidden focus, and unfinished controls into
	* reproducible browser evidence while ignoring deliberately closed UI vessels.
	*/

import { browserMetricHelpers } from "./RouteAuditMetricHelpers.mjs";

/** @returns {string} Self-contained browser expression for one settled page. */
export function auditMetricsExpression() {
	return `(${collectRouteMetrics.toString()})(${browserMetricHelpers.toString()}())`;
}

/**
	* Collects geometry and interaction evidence using helpers instantiated in-browser.
	* @param {object} helpers Serializable browser helper collection.
	* @returns {object} Structured viewport evidence consumed by severity policy.
	*/
function collectRouteMetrics(helpers) {
	if (!document.documentElement || !document.body) {
		return {
			pageUnavailable: true,
			href: location.href,
			title: document.title,
			viewport: { width: window.innerWidth, height: window.innerHeight }
		};
	}
	const viewportWidth = document.documentElement.clientWidth;
	const viewportHeight = window.innerHeight;
	const elements = [...document.body.querySelectorAll("*")];
	const visible = elements.filter(helpers.isVisible);
	const escaped = visible.filter(element => {
		const rect = element.getBoundingClientRect();
		if (rect.width <= 0 || helpers.hasIntentionalHorizontalScroller(element)) return false;
		if (helpers.isInsideIntentionallyClosedSurface(element, viewportWidth)) return false;
		return rect.left < -3 || rect.right > viewportWidth + 3;
	});
	const overlays = visible.filter(helpers.isOverlay).filter(element => {
		if (helpers.isInsideIntentionallyClosedSurface(element, viewportWidth)) return false;
		const rect = element.getBoundingClientRect();
		const horizontalEscape = rect.left < -3 || rect.right > viewportWidth + 3;
		if (getComputedStyle(element).position !== 'fixed') return horizontalEscape;
		return horizontalEscape || rect.top < -3 || rect.bottom > viewportHeight + 3;
	});
	const controls = visible.filter(helpers.isInteractive);
	const undersized = controls.filter(element => {
		if (element.matches('.visually-hidden,[aria-hidden="true"]')) return false;
		const rect = element.getBoundingClientRect();
		return rect.width < 40 || rect.height < 40;
	});
	const hiddenTabbables = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')]
		.filter(element => !isVisible(element) && element.tabIndex >= 0 && !element.closest('[inert]'));
	const bodyStyle = getComputedStyle(document.body);
	const defaultishControls = controls.filter(element => {
		const style = getComputedStyle(element);
		return style.borderStyle === "outset" || helpers.usesBrowserDefaultTimes(style.fontFamily);
	});
	return {
		href: location.href,
		title: document.title,
		viewport: { width: viewportWidth, height: viewportHeight },
		viewportMeta: document.querySelector('meta[name="viewport"]')?.content || "",
		document: { scrollWidth: document.documentElement.scrollWidth, horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 2 },
		escapedCount: escaped.length,
		escaped: escaped.slice(0, 12).map(helpers.describeElement),
		overlayEscapeCount: overlays.length,
		overlayEscapes: overlays.slice(0, 12).map(helpers.describeElement),
		undersizedControlCount: undersized.length,
		undersizedControls: undersized.slice(0, 12).map(helpers.describeElement),
		hiddenTabbableCount: hiddenTabbables.length,
		hiddenTabbables: hiddenTabbables.slice(0, 12).map(helpers.describeElement),
		defaultishControlCount: defaultishControls.length,
		defaultishControls: defaultishControls.slice(0, 12).map(helpers.describeElement),
		bodyDefaultSignals: {
			margin: bodyStyle.margin,
			fontFamily: bodyStyle.fontFamily,
			defaultMargin: bodyStyle.margin === "8px",
			defaultFont: helpers.usesBrowserDefaultTimes(bodyStyle.fontFamily)
		}
	};

	function isVisible(element) {
		const style = getComputedStyle(element);
		const rect = element.getBoundingClientRect();
		return style.display !== 'none' && style.visibility !== 'hidden' && Number(style.opacity) > .01 && rect.width > 0 && rect.height > 0;
	}

	function isInteractive(element) {
		return element.matches('button,input:not([type="hidden"]),select,textarea,summary,[role="button"],[role="menuitem"],a[class]');
	}

	function isOverlay(element) {
		const style = getComputedStyle(element);
		if (style.position === 'fixed' || style.position === 'sticky') return true;
		if (style.position !== 'absolute') return false;
		return element.matches(
			'dialog[open],[popover],[role="dialog"],[aria-modal="true"],[role="menu"],[role="listbox"]'
		);
	}

	function hasIntentionalHorizontalScroller(element) {
		for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
			const style = getComputedStyle(ancestor);
			if (/(auto|scroll)/.test(style.overflowX) && ancestor.scrollWidth > ancestor.clientWidth + 2) return true;
		}
		return false;
	}

	function describeElement(element) {
		const rect = element.getBoundingClientRect();
		return {
			tag: element.tagName.toLowerCase(),
			id: element.id || '',
			className: typeof element.className === 'string' ? element.className.slice(0, 160) : '',
			rect: [Math.round(rect.left), Math.round(rect.top), Math.round(rect.width), Math.round(rect.height)]
		};
	}
}
