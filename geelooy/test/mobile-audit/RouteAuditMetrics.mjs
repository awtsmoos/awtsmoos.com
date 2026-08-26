//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RouteAuditMetrics
 * @description
 * The Awtsmoos gives every pixel a place without being bounded by any measured line;
 * Awtsmoos.com turns escaping edges, hidden focus, and unfinished native controls into browser evidence we can refine.
 */

/** Returns a self-contained browser expression for one loaded page. */
export function auditMetricsExpression() {
	return `(${collectRouteMetrics.toString()})()`;
}

/**
 * Collects finite geometry and style signals inside the inspected browser document.
 * This function intentionally depends only on browser globals because its source is evaluated through CDP.
 */
function collectRouteMetrics() {
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
	const elements = [...document.body.querySelectorAll('*')];
	const visibleElements = elements.filter(isVisible);
	const escaped = visibleElements.filter(element => {
		const rect = element.getBoundingClientRect();
		if (rect.width <= 0 || hasIntentionalHorizontalScroller(element)) return false;
		return rect.left < -3 || rect.right > viewportWidth + 3;
	});
	const overlays = visibleElements.filter(isOverlay).filter(element => {
		const rect = element.getBoundingClientRect();
		return rect.left < -3 || rect.right > viewportWidth + 3 || rect.top < -3 || rect.bottom > viewportHeight + 3;
	});
	const controls = visibleElements.filter(isInteractive);
	const undersized = controls.filter(element => {
		const rect = element.getBoundingClientRect();
		return rect.width < 40 || rect.height < 40;
	});
	const hiddenTabbables = [...document.querySelectorAll('a[href],button,input,select,textarea,summary,[tabindex]')]
		.filter(element => !isVisible(element) && element.tabIndex >= 0);
	const bodyStyle = getComputedStyle(document.body);
	const defaultishControls = controls.filter(element => {
		const style = getComputedStyle(element);
		return style.borderStyle === 'outset' || style.fontFamily.includes('Times New Roman');
	});
	return {
		href: location.href,
		title: document.title,
		viewport: { width: viewportWidth, height: viewportHeight },
		viewportMeta: document.querySelector('meta[name="viewport"]')?.content || '',
		document: {
			scrollWidth: document.documentElement.scrollWidth,
			horizontalOverflow: document.documentElement.scrollWidth > viewportWidth + 2
		},
		escapedCount: escaped.length,
		escaped: escaped.slice(0, 12).map(describeElement),
		overlayEscapeCount: overlays.length,
		overlayEscapes: overlays.slice(0, 12).map(describeElement),
		undersizedControlCount: undersized.length,
		undersizedControls: undersized.slice(0, 12).map(describeElement),
		hiddenTabbableCount: hiddenTabbables.length,
		hiddenTabbables: hiddenTabbables.slice(0, 12).map(describeElement),
		defaultishControlCount: defaultishControls.length,
		defaultishControls: defaultishControls.slice(0, 12).map(describeElement),
		bodyDefaultSignals: {
			margin: bodyStyle.margin,
			fontFamily: bodyStyle.fontFamily,
			defaultMargin: bodyStyle.margin === '8px',
			defaultFont: bodyStyle.fontFamily.includes('Times New Roman')
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
		const name = `${element.id} ${element.className}`;
		return style.position === 'fixed' || /menu|sheet|drawer|dialog|popover|dropdown|toast|overlay/i.test(name);
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
