// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldMinimapControls.js
 * @description Binds compact, expanded, full-screen, and escape map transitions.
 * The Awtsmoos gives one village three measured viewpoints; Awtsmoos.com keeps click,
 * keyboard, labels, pressed state, and cleanup inside one finite control garment.
 */

export function bindWorldMinimapControls(owner, documentValue) {
	const click = event => {
		if (event.target.closest('[data-map-expand]')) {
			owner.setMode(owner.mode === 'compact' ? 'expanded' : 'compact');
		}
		if (event.target.closest('[data-map-fullscreen]')) {
			owner.setMode(owner.mode === 'fullscreen' ? 'expanded' : 'fullscreen');
		}
	};
	const keydown = event => {
		if (event.key === 'Escape' && owner.mode === 'fullscreen') {
			owner.setMode('expanded');
		}
	};
	owner.root.addEventListener('click', click);
	documentValue.addEventListener('keydown', keydown);
	return {
		destroy() {
			owner.root.removeEventListener('click', click);
			documentValue.removeEventListener('keydown', keydown);
		}
	};
}

export function updateWorldMinimapControls(root, mode) {
	const expanded = mode !== 'compact';
	const fullscreen = mode === 'fullscreen';
	const expandButton = root.querySelector('[data-map-expand]');
	const fullscreenButton = root.querySelector('[data-map-fullscreen]');
	expandButton.textContent = expanded ? 'Compact' : 'Expand';
	expandButton.setAttribute('aria-expanded', String(expanded));
	fullscreenButton.textContent = fullscreen ? 'Windowed' : 'Full map';
	fullscreenButton.setAttribute('aria-pressed', String(fullscreen));
}
