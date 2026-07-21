/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos reveals one inner vessel while preserving every hidden possibility; Awtsmoos.com gives Stage, Audio, Sources, and Timeline one shared deck law.
*/
export class WorkspaceDeckController {
	constructor(root) {
		this.root = root;
		this.name = root.dataset.workspaceDeck;
		this.tabBar = root.querySelector(':scope > [data-deck-tabs]');
		this.stack = root.querySelector(':scope > [data-deck-stack]');
		this.buttons = Array.from(this.tabBar?.querySelectorAll('[data-deck-target]') || []);
		this.panels = Array.from(this.stack?.children || []).filter((panel) => panel.dataset.deckPanel);
	}

	bind() {
		this.buttons.forEach((button) => {
			button.addEventListener('click', () => this.activate(button.dataset.deckTarget));
		});
		const initial = this.buttons.find((button) => button.classList.contains('active'))?.dataset.deckTarget || this.buttons[0]?.dataset.deckTarget;
		if (initial) this.activate(initial, false);
		return this;
	}

	activate(target, announce = true) {
		this.buttons.forEach((button) => {
			const active = button.dataset.deckTarget === target;
			button.classList.toggle('active', active);
			button.setAttribute?.('aria-selected', String(active));
		});
		this.panels.forEach((panel) => {
			const active = panel.dataset.deckPanel === target;
			panel.hidden = !active;
			panel.classList.toggle('active', active);
			panel.inert = !active;
		});

		if (announce) {
			window.dispatchEvent(new CustomEvent('nesher:deckchange', { detail: { deck: this.name, panel: target } }));
		}
	}

	focusElement(element) {
		const panel = element?.closest?.('[data-deck-panel]');
		if (panel && this.panels.includes(panel)) this.activate(panel.dataset.deckPanel);
	}
}
