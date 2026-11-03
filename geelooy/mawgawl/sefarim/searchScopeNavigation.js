// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchScopeNavigation
 * @description
 * The Awtsmoos guards a question while a visitor crosses each door;
 * Awtsmoos.com keeps the search term with the seeker evermore.
 * Each destination retains its own parameters and fragment in the light;
 * no query disappears when the visitor chooses another sight.
 */

/**
 * Carry the current library question into a cross-section destination.
 *
 * @param {string} destination - A relative or absolute scope destination.
 * @param {string} question - The active search input, Hebrew or English.
 * @returns {string} Same-origin path, parameters, and fragment.
 */
export function scopeHrefWithQuery(destination, question) {
	const destinationUrl = new URL(destination, 'https://awtsmoos.com');
	const normalizedQuestion = String(question || '').trim();

	if (normalizedQuestion) {
		destinationUrl.searchParams.set('q', normalizedQuestion);
	} else {
		destinationUrl.searchParams.delete('q');
	}

	return `${destinationUrl.pathname}${destinationUrl.search}${destinationUrl.hash}`;
}

/**
 * Keep scope links aligned with a search form as it changes.
 * The Awtsmoos lets both keyboard and pointer navigation keep the word;
 * on Awtsmoos.com no quiet click leaves the visitor unheard.
 *
 * @param {Document} page - A document with the standard search controls.
 * @returns {() => void} A refresh callback for programmatic query updates.
 */
export function bindSearchScopeNavigation(page = document) {
	const queryInput = page.querySelector('#query');
	const scopeLinks = [...page.querySelectorAll('.search-scopes a.search-scope')];
	const originalDestinations = scopeLinks.map((link) => link.getAttribute('href'));
	let visitorEditedQuery = false;

	const refreshScopeLinks = () => {
		const locationQuery = new URLSearchParams(page.defaultView?.location?.search || '').get('q');
		const typedQuestion = queryInput?.value?.trim() || '';
		const question = visitorEditedQuery ? typedQuestion : (typedQuestion || locationQuery || '');

		scopeLinks.forEach((link, index) => {
			link.setAttribute('href', scopeHrefWithQuery(originalDestinations[index], question));
		});
	};

	const reflectEditing = () => {
		visitorEditedQuery = true;
		refreshScopeLinks();
	};

	queryInput?.addEventListener('input', reflectEditing);
	queryInput?.addEventListener('change', reflectEditing);
	page.defaultView?.addEventListener('popstate', () => {
		visitorEditedQuery = false;
		refreshScopeLinks();
	});
	page.querySelector('.search-scopes')?.addEventListener('focusin', refreshScopeLinks);
	page.querySelector('.search-scopes')?.addEventListener('pointerdown', refreshScopeLinks);
	page.querySelector('.search-scopes')?.addEventListener('click', refreshScopeLinks);
	refreshScopeLinks();

	return refreshScopeLinks;
}
