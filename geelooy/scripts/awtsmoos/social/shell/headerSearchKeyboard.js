//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module HeaderSearchKeyboard
 * @description
 * The Awtsmoos renews each possible route before the finger or key can arrive;
 * Awtsmoos.com lets the one living search doorway move through real links without trapping native browser life.
 */

const RESULT_SELECTOR = '[data-search-result]';

/**
 * Binds global command shortcuts and local result traversal while preserving Tab and native anchor activation.
 * @param {object} options - The finite vessels of the living search doorway.
 * @param {HTMLElement} options.form - Search form whose open state reveals suggestions.
 * @param {HTMLInputElement} options.input - Canonical search field.
 * @param {HTMLElement} options.suggestions - Suggestion surface containing route/Torah anchors.
 * @param {Function} options.onOpen - Opens the search without inventing parallel state.
 * @param {Function} options.onClose - Closes the suggestion surface.
 */
export function bindHeaderSearchKeyboard({ form, input, suggestions, onOpen, onClose }) {
	const ownerDocument = form.ownerDocument;
	ownerDocument.addEventListener('keydown', event => {
		handleGlobalKey(event, form, input, onOpen, onClose);
	});
	input.addEventListener('keydown', event => {
		handleInputKey(event, form, suggestions);
	});
	suggestions.addEventListener('keydown', event => {
		handleResultKey(event, input, suggestions, onClose);
	});
}

/**
 * Opens or closes the global lens through shortcuts without stealing slash from active editors.
 */
function handleGlobalKey(event, form, input, onOpen, onClose) {
	const typing = isTypingTarget(event.target);
	if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
		event.preventDefault();
		onOpen();
		return;
	}
	if (event.key === '/' && !typing) {
		event.preventDefault();
		onOpen();
		return;
	}
	if (event.key === 'Escape' && form.dataset.open === 'true') {
		event.preventDefault();
		onClose();
		input.focus();
	}
}

/**
 * Moves from the text field into the first or last visible destination only when suggestions are open.
 */
function handleInputKey(event, form, suggestions) {
	if (form.dataset.open !== 'true') return;
	if (event.key === 'ArrowDown') {
		event.preventDefault();
		focusResult(suggestions, 0);
	}
	if (event.key === 'ArrowUp') {
		event.preventDefault();
		focusResult(suggestions, -1);
	}
}

/**
 * Cycles real result anchors with arrow/Home/End keys while leaving Tab and Enter entirely native.
 */
function handleResultKey(event, input, suggestions, onClose) {
	const current = event.target?.closest?.(RESULT_SELECTOR);
	if (!current) return;
	const results = resultLinks(suggestions);
	const currentIndex = results.indexOf(current);
	const destinations = {
		ArrowDown: currentIndex + 1,
		ArrowUp: currentIndex - 1,
		Home: 0,
		End: results.length - 1
	};
	if (event.key === 'Escape') {
		event.preventDefault();
		onClose();
		input.focus();
		return;
	}
	if (!(event.key in destinations)) return;
	event.preventDefault();
	focusResult(suggestions, destinations[event.key]);
}

function focusResult(suggestions, requestedIndex) {
	const results = resultLinks(suggestions);
	if (!results.length) return;
	const wrappedIndex = (requestedIndex + results.length) % results.length;
	results[wrappedIndex].focus();
}

function resultLinks(suggestions) {
	return [...suggestions.querySelectorAll(RESULT_SELECTOR)];
}

function isTypingTarget(target) {
	return Boolean(target?.matches?.('input, textarea, select, [contenteditable="true"]'));
}
