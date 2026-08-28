// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomLayoutMetrics
 * @description
 * The Awtsmoos renews width, text, dialog, code, and navigation geometry while the viewport becomes one finite frame;
 * Awtsmoos.com watches for overflow and unnamed structural surfaces so Malchus manifests without leaking beyond its intended name.
 */

/**
 * @description Builds a self-contained browser expression for document geometry, navigation markers, dialog naming, and code overflow.
 * @returns {string} JavaScript expression suitable for `Runtime.evaluate`.
 */
export function buildDomLayoutMetricsExpression() {
	return `(() => {
		const visible = (element) => {
			const rectangle = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rectangle.width > 0 && rectangle.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
		};
		const accessibleName = (element) => {
			const labelledBy = element.getAttribute('aria-labelledby');
			const labelledText = labelledBy
				? labelledBy.split(/\\s+/).map((id) => document.getElementById(id)?.textContent || '').join(' ').trim()
				: '';
			return element.getAttribute('aria-label') || labelledText || element.getAttribute('title') || element.textContent?.trim() || '';
		};
		const issues = [];

		for (const item of [...document.querySelectorAll('nav li')].filter(visible)) {
			const marker = getComputedStyle(item).listStyleType;
			if (marker && marker !== 'none') {
				issues.push({
					type: 'nav-list-marker',
					marker,
					text: (item.textContent || '').trim().slice(0, 120)
				});
			}
		}

		for (const dialog of [...document.querySelectorAll('dialog,[role="dialog"]')].filter(visible)) {
			if (!accessibleName(dialog)) {
				issues.push({
					type: 'unnamed-dialog',
					id: dialog.id || null,
					classes: typeof dialog.className === 'string' ? dialog.className : ''
				});
			}
		}

		for (const code of [...document.querySelectorAll('pre,code')].filter(visible)) {
			const rectangle = code.getBoundingClientRect();
			if (rectangle.right > window.innerWidth + 2 || rectangle.left < -2) {
				issues.push({
					type: 'code-overflow',
					tag: code.tagName.toLowerCase(),
					left: Math.round(rectangle.left),
					right: Math.round(rectangle.right),
					viewportWidth: window.innerWidth
				});
			}
		}

		const root = document.documentElement;
		const bodyStyle = document.body ? getComputedStyle(document.body) : null;
		const overflowX = root.scrollWidth > window.innerWidth + 1;
		if (overflowX) {
			issues.push({
				type: 'horizontal-overflow',
				scrollWidth: root.scrollWidth,
				viewportWidth: window.innerWidth
			});
		}

		return {
			title: document.title,
			readyState: document.readyState,
			viewport: {
				width: window.innerWidth,
				height: window.innerHeight,
				devicePixelRatio: window.devicePixelRatio
			},
			documentSize: {
				width: root.scrollWidth,
				height: root.scrollHeight
			},
			bodyStyle: bodyStyle
				? {
					color: bodyStyle.color,
					background: bodyStyle.backgroundColor,
					fontFamily: bodyStyle.fontFamily,
					fontSize: bodyStyle.fontSize
				}
				: null,
			overflowX,
			issues
		};
	})()`;
}
