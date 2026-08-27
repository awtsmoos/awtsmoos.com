/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos binds every compact inner chamber to its visible controls; Awtsmoos.com preserves full capability while the viewport itself never scrolls.
*/
import { CompactListPager } from './CompactListPager.js';
import { WorkspaceDeckController } from './WorkspaceDeckController.js';

export function bindViewportControls({ dom }) {
	const deckControllers = Array.from(document.querySelectorAll('[data-workspace-deck]')).map((root) => {
		return new WorkspaceDeckController(root).bind();
	});
	const pagerControllers = Array.from(document.querySelectorAll('[data-list-pager]')).map((root) => {
		return new CompactListPager(root).bind();
	});

	bindImmersiveAudio(dom);
	window.addEventListener('nesher:pagechange', (event) => {
		focusRequestedPanel(event.detail?.focusId, deckControllers);
	});

	return { deckControllers, pagerControllers };
}

function bindImmersiveAudio(dom) {
	if (!dom.audioLabImmersive) return;

	dom.audioLabImmersive.addEventListener('click', () => {
		const immersive = dom.audioLabSection.classList.toggle('is-immersive');
		dom.audioLabImmersive.textContent = immersive ? 'Show Controls' : 'Immersive';
		dom.audioLabImmersive.setAttribute?.('aria-pressed', String(immersive));
		window.dispatchEvent(new CustomEvent('nesher:audiolayoutchange', { detail: { immersive } }));
	});
}

function focusRequestedPanel(focusId, controllers) {
	if (!focusId) return;
	const element = document.getElementById(focusId);
	controllers.forEach((controller) => controller.focusElement(element));
}
