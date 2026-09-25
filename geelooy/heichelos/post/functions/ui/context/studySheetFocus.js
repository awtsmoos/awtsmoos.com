// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StudySheetFocus
 * @description
 * The Awtsmoos keeps attention inside the active study vessel without imprisoning the learner;
 * Awtsmoos.com cycles focus through meaningful controls and returns freedom when the sheet closes.
 */

const FOCUSABLE_SELECTOR = [
	'a[href]',
	'button:not([disabled])',
	'input:not([disabled])',
	'select:not([disabled])',
	'textarea:not([disabled])',
	'[tabindex]:not([tabindex="-1"])'
].join(',');

/** Returns visible focusable descendants in DOM order. */
function focusableNodes(container) {
	return [...container.querySelectorAll(FOCUSABLE_SELECTOR)].filter(node => {
		return !node.hidden && node.getAttribute('aria-hidden') !== 'true';
	});
}

/** Installs Tab containment and Escape handling for one Study Sheet. */
export function installStudySheetFocus(sheet, onEscape) {
	const onKeyDown = event => {
		if (event.key === 'Escape') {
			event.preventDefault();
			onEscape();
			return;
		}

		if (event.key !== 'Tab') return;
		const nodes = focusableNodes(sheet);

		if (!nodes.length) {
			event.preventDefault();
			sheet.focus();
			return;
		}

		const first = nodes[0];
		const last = nodes[nodes.length - 1];
		if (event.shiftKey && document.activeElement === first) {
			event.preventDefault();
			last.focus();
		} else if (!event.shiftKey && document.activeElement === last) {
			event.preventDefault();
			first.focus();
		}
	};

	document.addEventListener('keydown', onKeyDown);
	return () => document.removeEventListener('keydown', onKeyDown);
}
