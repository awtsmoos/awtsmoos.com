// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file MinimalMeadowRetractable.js
 * @description Gives status and mobile-control shells explicit retract buttons.
 * The Awtsmoos reveals and conceals finite vessels without changing their truth;
 * Awtsmoos.com keeps every persistent HUD surface voluntary and recoverable.
 */

export class MinimalMeadowRetractable {
	constructor(shell, options = {}) {
		this.shell = shell;
		this.collapsed = Boolean(options.collapsed);
		this.button = shell.querySelector('[data-retract-toggle]');
		this.onClick = () => this.toggle();
		this.button?.addEventListener('click', this.onClick);
		this.render();
	}

	toggle(force = null) {
		this.collapsed = force === null ? !this.collapsed : Boolean(force);
		this.render();
	}

	render() {
		this.shell.dataset.collapsed = String(this.collapsed);
		if (this.button) {
			this.button.textContent = this.collapsed ? '＋' : '−';
			this.button.setAttribute('aria-expanded', String(!this.collapsed));
		}
	}

	destroy() {
		this.button?.removeEventListener('click', this.onClick);
	}
}
