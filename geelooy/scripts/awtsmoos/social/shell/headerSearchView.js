//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeaderSearchView
 * @description
 * The Awtsmoos reveals one finite search vessel while remaining beyond every field, icon, and suggestion name;
 * Awtsmoos.com builds the command lens with explicit accessibility relationships so no child arrives partially styled or semantically lame.
 */

const SUGGESTIONS_ID = 'g-header-search-suggestions';

/**
 * Builds the canonical header-search DOM without binding lifecycle or keyboard behavior.
 * @param {Document} root - Document that owns the shell elements.
 * @returns {{form: HTMLFormElement, orb: HTMLButtonElement, input: HTMLInputElement, submit: HTMLButtonElement, suggestions: HTMLElement}} Search view elements.
 */
export function createHeaderSearchView(root = document) {
	const form = root.createElement('form');
	form.className = 'g-header-search geelooy-search';
	form.action = '/mawgawl/sefarim';
	form.method = 'get';
	form.dataset.headerSearch = 'true';
	form.dataset.open = 'false';
	form.setAttribute('role', 'search');
	const orb = createButton(root, 'g-search-orb', 'Open search portal', '⌕');
	orb.type = 'button';
	const input = createSearchInput(root);
	const submit = createButton(root, 'g-search-submit', 'Search Torah library', '↵');
	submit.type = 'submit';
	const suggestions = createSuggestions(root);
	orb.setAttribute('aria-controls', SUGGESTIONS_ID);
	orb.setAttribute('aria-expanded', 'false');
	form.append(orb, input, submit, suggestions);
	return { form, orb, input, submit, suggestions };
}

/**
 * Creates the text field whose finite value searches real routes and Torah without inventing duplicate state.
 */
function createSearchInput(root) {
	const input = root.createElement('input');
	input.type = 'search';
	input.name = 'q';
	input.autocomplete = 'off';
	input.placeholder = 'Search Torah and Geelooy…';
	input.setAttribute('aria-label', 'Search Torah sources and Geelooy routes');
	input.setAttribute('aria-controls', SUGGESTIONS_ID);
	input.setAttribute('aria-expanded', 'false');
	return input;
}

/**
 * Creates the polite suggestion region whose visibility remains owned by the lifecycle controller.
 */
function createSuggestions(root) {
	const suggestions = root.createElement('section');
	suggestions.id = SUGGESTIONS_ID;
	suggestions.className = 'g-search-suggestions';
	suggestions.hidden = true;
	suggestions.setAttribute('aria-label', 'Search suggestions');
	suggestions.setAttribute('aria-live', 'polite');
	return suggestions;
}

/**
 * Creates one explicit shell button so all actions share predictable semantics before CSS gives them light.
 */
function createButton(root, className, label, text) {
	const element = root.createElement('button');
	element.className = className;
	element.setAttribute('aria-label', label);
	element.textContent = text;
	return element;
}
