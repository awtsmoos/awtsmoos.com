// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DomControlMetrics
 * @description
 * The Awtsmoos renews every visible control while names, touch areas, and native affordances become finite keilim;
 * Awtsmoos.com measures only genuine interaction surfaces so accessibility evidence expands without mistaking programmatic cells for living doors.
 */

/**
 * @description Builds a self-contained browser expression for visible control naming, touch geometry, and native-style risk.
 * @param {number} minimumTargetSize - Minimum width and height for key touch controls.
 * @returns {string} JavaScript expression suitable for `Runtime.evaluate`.
 */
export function buildDomControlMetricsExpression(minimumTargetSize) {
	return `(() => {
		const minimumTargetSize = ${Number(minimumTargetSize)};
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
			const nativeLabel = element.labels
				? [...element.labels].map((label) => label.textContent || '').join(' ').trim()
				: '';
			return element.getAttribute('aria-label') || labelledText || nativeLabel || element.getAttribute('alt') || element.getAttribute('title') || element.getAttribute('placeholder') || element.textContent?.trim() || '';
		};
		const universalUiLoaded = [...document.styleSheets].some((sheet) => /\\/style\\/universal-ui\\.css/i.test(sheet.href || '')) || Boolean(document.querySelector('link[href*="/style/universal-ui.css"]'));
		const touchTarget = (element) => {
			if (element instanceof HTMLInputElement && ['checkbox', 'radio'].includes(element.type)) {
				return [...(element.labels || [])].find(visible) || element;
			}
			return element;
		};
		const semanticSelector = 'button,input:not([type="hidden"]),select,textarea,a[href],summary,[role="button"]';
		const focusSelector = '[tabindex]:not([tabindex="-1"])';
		const keySelector = 'button,input:not([type="hidden"]),select,textarea,summary,[role="button"],nav a[href]';
		const controls = [...new Set([
			...document.querySelectorAll(semanticSelector),
			...document.querySelectorAll(focusSelector)
		])].filter(visible);
		const keyControls = [...new Set([
			...document.querySelectorAll(keySelector)
		].filter(visible).map(touchTarget))];
		const issues = [];

		for (const element of keyControls) {
			const rectangle = element.getBoundingClientRect();
			if (rectangle.width < minimumTargetSize || rectangle.height < minimumTargetSize) {
				issues.push({
					type: 'small-target',
					tag: element.tagName.toLowerCase(),
					name: accessibleName(element).slice(0, 120),
					width: Math.round(rectangle.width),
					height: Math.round(rectangle.height)
				});
			}
		}

		for (const element of controls) {
			const rectangle = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			const name = accessibleName(element).slice(0, 120);
			const nativeTag = ['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
			if (!name) {
				issues.push({
					type: 'missing-accessible-name',
					control: {
						tag: element.tagName.toLowerCase(),
						id: element.id || null,
						classes: typeof element.className === 'string' ? element.className : '',
						tabIndex: element.tabIndex,
						width: Math.round(rectangle.width),
						height: Math.round(rectangle.height)
					}
				});
			}
			if (nativeTag && !element.className && !universalUiLoaded && style.appearance !== 'none') {
				issues.push({
					type: 'native-unstyled-risk',
					control: {
						tag: element.tagName.toLowerCase(),
						id: element.id || null,
						name
					}
				});
			}
		}

		return {
			universalUiLoaded,
			controlCount: controls.length,
			keyControlCount: keyControls.length,
			issues
		};
	})()`;
}
