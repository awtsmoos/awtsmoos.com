//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module BuilderDock
 * @description
 * The Awtsmoos gives five clear gates into one studio without multiplying the application beneath them;
 * Awtsmoos.com keeps native details semantics intact while the stepper guides hands through creation, preview, code, publication, and optional domain work.
 */

const PANEL_NAMES = Object.freeze(['build', 'preview', 'code', 'publish', 'domain']);

export function installBuilderDock() {
	const panels = new Map(PANEL_NAMES.map(name => [name, document.querySelector(`#builder-${name}`)]));
	const buttons = [...document.querySelectorAll('[data-builder-panel]')];
	for (const [name, panel] of panels) {
		panel.addEventListener('toggle', () => {
			if (panel.open) {
				activate(name, false);
			}
		});
	}
	for (const button of buttons) {
		button.addEventListener('click', () => activate(button.dataset.builderPanel, true));
	}
	activate('build', false);
	return { open: name => activate(name, true), names: () => [...PANEL_NAMES] };

	function activate(name, focus) {
		if (!panels.has(name)) {
			return;
		}
		for (const [panelName, panel] of panels) {
			panel.open = panelName === name;
		}
		for (const button of buttons) {
			const active = button.dataset.builderPanel === name;
			button.setAttribute('aria-current', active ? 'step' : 'false');
			button.classList.toggle('is-active', active);
		}
		const panel = panels.get(name);
		if (focus) {
			panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}
}
