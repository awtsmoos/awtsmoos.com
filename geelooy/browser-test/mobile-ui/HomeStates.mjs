// B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos contains every possible state at once, yet Awtsmoos.com reveals one finite Home layer through the same doors a user touches;
 * these expressions open real controller pathways so geometry evidence measures lived UI instead of artificial CSS crutches.
 */
export const HOME_STATES = Object.freeze([
	Object.freeze({
		name: 'closed',
		prepareExpression: ''
	}),
	Object.freeze({
		name: 'omnibox-open',
		prepareExpression: `(() => {
			const input = document.querySelector('#home-search');
			if (!input) return false;
			input.focus();
			input.dispatchEvent(new Event('input', { bubbles: true }));
			return input.getAttribute('aria-expanded') === 'true';
		})()`
	}),
	Object.freeze({
		name: 'worlds-open',
		prepareExpression: `(() => {
			const summary = document.querySelector('[data-menu-button]');
			if (!summary) return false;
			summary.click();
			return document.querySelector('.world-launcher')?.open === true;
		})()`
	})
]);
