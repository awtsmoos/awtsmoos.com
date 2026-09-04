//B"H
// Boruch Hashem
// Blessed is He
/**
 * @file viewportBindings.js
 * @description Awakens compact professional deck and pager controls without making them the primary mobile navigation model.
 * The Awtsmoos lets hidden workstations remain fully alive while the beginner sees only the canvas and chosen intent;
 * Awtsmoos.com binds those deeper kelim faithfully, so progressive disclosure preserves rather than abandons content.
 */
import { CompactListPager } from './CompactListPager.js';
import { WorkspaceDeckController } from './WorkspaceDeckController.js';

/**
 * Binds every mounted professional deck, compact pager, and immersive-audio layout control.
 * @param {object} input Shared DOM anchors.
 * @returns {{deckControllers:Array, pagerControllers:Array}} Bound controller collections.
 */
export function bindViewportControls({ dom } = {}) {
	const deckControllers = bindWorkspaceDecks();
	const pagerControllers = bindCompactPagers();

	bindImmersiveAudio(dom);
	bindRequestedPanelFocus(deckControllers);
	return {
		deckControllers,
		pagerControllers
	};
}

function bindWorkspaceDecks() {
	return Array.from(
		document.querySelectorAll('[data-workspace-deck]')
	).map((root) => {
		return new WorkspaceDeckController(root).bind();
	});
}

function bindCompactPagers() {
	return Array.from(
		document.querySelectorAll('[data-list-pager]')
	).map((root) => {
		return new CompactListPager(root).bind();
	});
}

function bindImmersiveAudio(dom) {
	if (!dom?.audioLabImmersive) {
		return;
	}

	dom.audioLabImmersive.addEventListener('click', () => {
		const immersive = dom.audioLabSection.classList.toggle('is-immersive');
		dom.audioLabImmersive.textContent = immersive
			? 'Show Controls'
			: 'Immersive';
		dom.audioLabImmersive.setAttribute(
			'aria-pressed',
			String(immersive)
		);
		window.dispatchEvent(
			new CustomEvent('nesher:audiolayoutchange', {
				detail: {
					immersive
				}
			})
		);
	});
}

function bindRequestedPanelFocus(controllers) {
	window.addEventListener('nesher:pagechange', (event) => {
		const focusId = event.detail?.focusId;

		if (!focusId) {
			return;
		}

		const element = document.getElementById(focusId);
		requestAnimationFrame(() => {
			for (const controller of controllers) {
				controller.focusElement(element);
			}
		});
	});
}
