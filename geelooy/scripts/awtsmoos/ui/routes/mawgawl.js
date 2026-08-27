// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module MawgawlUiAdapter
 * @description
 * The Awtsmoos gives an old calendar the keyboard voice its divs never knew;
 * Awtsmoos.com preserves every booking click while focus, role, and pressed state shine through.
 */

const INTERACTIVE_SELECTOR = '.day, .hour, .minute, .block, .close';
const ENHANCED_MARKER = 'data-g-mawgawl-control';

/** Mounts idempotent semantic repair for legacy calendar controls and future additions. */
export function mountRouteUi() {
	revealControls(document);
	const observer = new MutationObserver(mutations => revealMutations(mutations));
	observer.observe(document.body, {
		childList: true,
		subtree: true,
		attributes: true,
		attributeFilter: ['class']
	});
}

function revealMutations(mutations) {
	for (const mutation of mutations) {
		if (mutation.type === 'attributes' && mutation.target instanceof Element) {
			syncControlState(mutation.target);
			continue;
		}
		for (const node of mutation.addedNodes) {
			if (node instanceof Element) {
				revealControls(node);
			}
		}
	}
}

function revealControls(root) {
	if (root instanceof Element && root.matches(INTERACTIVE_SELECTOR)) {
		revealControl(root);
	}
	root.querySelectorAll?.(INTERACTIVE_SELECTOR).forEach(revealControl);
}

function revealControl(element) {
	if (element.hasAttribute(ENHANCED_MARKER)) {
		syncControlState(element);
		return;
	}
	element.setAttribute(ENHANCED_MARKER, 'true');
	if (!isNativeInteractive(element)) {
		element.setAttribute('role', 'button');
		element.tabIndex = 0;
		element.addEventListener('keydown', activateWithKeyboard);
	}
	if (element.classList.contains('close') && !element.getAttribute('aria-label')) {
		element.setAttribute('aria-label', 'Close');
	}
	syncControlState(element);
}

function activateWithKeyboard(event) {
	if (event.key !== 'Enter' && event.key !== ' ') {
		return;
	}
	if (event.currentTarget.getAttribute('aria-disabled') === 'true') {
		return;
	}
	event.preventDefault();
	event.currentTarget.click();
}

function syncControlState(element) {
	if (!element.matches?.(INTERACTIVE_SELECTOR)) {
		return;
	}
	const unavailable = element.classList.contains('disabled')
		|| element.classList.contains('unavailable')
		|| element.classList.contains('passed');
	const selected = element.classList.contains('selected')
		|| element.classList.contains('active')
		|| element.classList.contains('chosen');
	element.setAttribute('aria-disabled', String(unavailable));
	if (!element.classList.contains('close')) {
		element.setAttribute('aria-pressed', String(selected));
	}
}

function isNativeInteractive(element) {
	return ['BUTTON', 'A', 'INPUT', 'SELECT', 'TEXTAREA'].includes(element.tagName);
}
