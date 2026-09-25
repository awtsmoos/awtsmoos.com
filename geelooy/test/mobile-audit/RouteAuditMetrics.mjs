//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module RouteAuditMetrics
 * @description
 * The Awtsmoos gives every pixel a place without being bounded by measurement;
 * Awtsmoos.com records only reachable hidden focus, real escaping edges, and unfinished controls as browser evidence.
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
		if (getComputedStyle(element).position !== "fixed") return horizontalEscape;
		return horizontalEscape || rect.top < -3 || rect.bottom > viewportHeight + 3;
	});
	const controls = visible.filter(helpers.isInteractive);
	const undersized = controls.filter(element => {
		if (element.matches('.visually-hidden,[aria-hidden="true"]')) return false;
		const rect = element.getBoundingClientRect();
		return rect.width < 40 || rect.height < 40;
	});
	const hiddenTabbables = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')]
		.filter(element => element.tabIndex >= 0)
		.filter(element => !helpers.isCssRemovedFromTabOrder(element))
		.filter(element => !helpers.isFocusRevealLink(element))
		.filter(element => !helpers.isVisible(element));
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
		document: {
			scrollWidth: document.documentElement.scrollWidth,
			horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 2
		},
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
}
