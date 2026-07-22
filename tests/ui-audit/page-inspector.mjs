// B"H
// Boruch Hashem
// Blessed is He
/**
 * @fileoverview
 * Inspects rendered Awtsmoos.com pages for geometry, semantics, and interaction
 * affordances without clicking destructive controls. This Gevurah witness turns
 * DOM possibility into explicit evidence. The Awtsmoos creates every element;
 * the audit merely asks whether each visible vessel communicates its purpose.
 */

/**
 * Returns a serializable expression that examines the current document.
 *
 * @returns {string} Browser-side JavaScript expression.
 */
export function pageInspectionExpression() {
	return `(() => {
		const visible = element => {
			const rectangle = element.getBoundingClientRect();
			const style = getComputedStyle(element);
			return rectangle.width > 0
				&& rectangle.height > 0
				&& style.display !== 'none'
				&& style.visibility !== 'hidden';
		};
		const accessibleName = element => {
			const values = [
				element.getAttribute('aria-label'),
				element.getAttribute('title'),
				element.textContent,
				element.value,
				element.getAttribute('alt')
			];
			return values.find(value => String(value || '').trim()) || '';
		};
		const controls = [...document.querySelectorAll(
			'button, [role="button"], input[type="button"], input[type="submit"], input[type="reset"]'
		)].filter(visible);
		const links = [...document.querySelectorAll('a')].filter(visible);
		const fields = [...document.querySelectorAll(
			'input:not([type="hidden"]), select, textarea, [contenteditable="true"]'
		)].filter(visible);
		const unnamedControls = controls
			.filter(element => !accessibleName(element))
			.map(element => element.outerHTML.slice(0, 220));
		const invalidLinks = links
			.filter(link => {
				const href = String(link.getAttribute('href') || '').trim();
				return !href || href === '#' || /^javascript:/i.test(href);
			})
			.map(link => link.outerHTML.slice(0, 220));
		const unlabeledFields = fields
			.filter(field => {
				if (field.getAttribute('aria-label')
					|| field.getAttribute('aria-labelledby')
					|| field.getAttribute('title')) {
					return false;
				}
				if (field.id && document.querySelector('label[for="' + CSS.escape(field.id) + '"]')) {
					return false;
				}
				return !field.closest('label');
			})
			.map(field => field.outerHTML.slice(0, 220));
		const undersizedTargets = controls
			.concat(links)
			.filter(element => {
				const rectangle = element.getBoundingClientRect();
				return rectangle.width < 40 || rectangle.height < 40;
			})
			.map(element => ({
				tag: element.tagName.toLowerCase(),
				name: accessibleName(element).trim().replace(/\\s+/g, ' ').slice(0, 80),
				width: Math.round(element.getBoundingClientRect().width),
				height: Math.round(element.getBoundingClientRect().height)
			}));
		const currentLinks = links.filter(link => link.getAttribute('aria-current') === 'page');
		return {
			finalUrl: location.href,
			title: document.title,
			readyState: document.readyState,
			shellReady: document.documentElement.classList.contains('geelooy-route-ready')
				|| document.body.classList.contains('geelooy-app-shell'),
			viewportWidth: innerWidth,
			documentWidth: document.documentElement.scrollWidth,
			horizontalOverflow: document.documentElement.scrollWidth > innerWidth + 2,
			bodyTextLength: document.body.innerText.length,
			visibleControls: controls.length,
			visibleLinks: links.length,
			visibleFields: fields.length,
			unnamedControls,
			unlabeledFields,
			invalidLinks,
			undersizedTargets: undersizedTargets.slice(0, 30),
			currentRouteLinks: currentLinks.length
		};
	})()`;
}

/**
 * Classifies audit results into blocking failures and advisory observations.
 *
 * @param {object} result One route result.
 * @param {boolean} mobile Whether the viewport is mobile.
 * @returns {{failures: string[], advisories: string[]}} Classified evidence.
 */
export function classifyRouteResult(result, mobile) {
	const failures = [];
	const advisories = [];
	const label = `${result.route} (${mobile ? 'mobile' : 'desktop'})`;
	if (![200, 301, 302, 307, 308].includes(result.httpStatus)) {
		failures.push(`${label}: HTTP ${result.httpStatus}`);
	}
	if (!result.ready) {
		failures.push(`${label}: document did not become ready`);
	}
	if (result.dom.horizontalOverflow) {
		failures.push(`${label}: horizontal overflow`);
	}
	if (result.dom.unnamedControls.length) {
		failures.push(`${label}: ${result.dom.unnamedControls.length} unnamed controls`);
	}
	if (result.dom.unlabeledFields.length) {
		failures.push(`${label}: ${result.dom.unlabeledFields.length} unlabeled fields`);
	}
	if (result.dom.invalidLinks.length) {
		advisories.push(`${label}: ${result.dom.invalidLinks.length} command-like or empty links`);
	}
	if (mobile && result.dom.undersizedTargets.length) {
		advisories.push(`${label}: ${result.dom.undersizedTargets.length} visible targets under 40px`);
	}
	return { failures, advisories };
}
