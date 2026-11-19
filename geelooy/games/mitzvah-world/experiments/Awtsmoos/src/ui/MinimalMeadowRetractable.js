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
		// B"H round 2: a bare -/+ glyph reads as a mystery control (the owner
		// flagged the top "-" as purposeless). The label names the shell it hides.
		this.label = options.label || '';
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
			const glyph = this.collapsed ? '＋' : '−';
			this.button.textContent = this.label ? `${this.label} ${glyph}` : glyph;
			this.button.setAttribute('aria-expanded', String(!this.collapsed));
			this.button.setAttribute('aria-label',
				`${this.collapsed ? 'Expand' : 'Collapse'} ${this.label || 'controls'}`);
		}
	}

	destroy() {
		this.button?.removeEventListener('click', this.onClick);
	}
}
