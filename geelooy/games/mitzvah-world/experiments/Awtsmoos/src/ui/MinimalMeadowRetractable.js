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
		// B"H round 7: one shell, one retractable. The staged UI components
		// and the direct-play presentation both construct a retractable for
		// the same shell; without this guard the button gained TWO click
		// listeners and every click toggled twice — the retract buttons
		// looked dead in the shipped game (proven by live probe 2026-11-19:
		// click left dataset.collapsed and the label unchanged). Returning
		// the live instance makes construction idempotent per shell.
		if (shell?.__awtsmoosRetractable) return shell.__awtsmoosRetractable;
		this.shell = shell;
		this.collapsed = Boolean(options.collapsed);
		// B"H round 2: a bare -/+ glyph reads as a mystery control (the owner
		// flagged the top "-" as purposeless). The label names the shell it hides.
		this.label = options.label || '';
		this.button = shell.querySelector('[data-retract-toggle]');
		this.onClick = () => this.toggle();
		this.button?.addEventListener('click', this.onClick);
		if (shell) shell.__awtsmoosRetractable = this;
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
		if (this.shell?.__awtsmoosRetractable === this) delete this.shell.__awtsmoosRetractable;
	}
}

/**
 * Wires the HUD and Controls retract toggles on a staged runtime and publishes
 * the single live instances for the rich UI to reuse instead of double-listening.
 * A missing shell simply yields no retractable; the presentation never fails for it.
 * @param {object} runtime Staged runtime with hosts and retractable slots.
 * @param {Document} [documentValue=globalThis.document] Owning document for shell lookup.
 * @returns {{mobileRetract: MinimalMeadowRetractable|null, playerRetract: MinimalMeadowRetractable|null}} Live retractables by shell.
 */
export function installMinimalMeadowShellRetractables(runtime, documentValue = globalThis.document) {
	return {
		mobileRetract: retractableFor(runtime, 'mobileRetract', shellFor(runtime, documentValue, 'mobileShell', '#mobileControls'), 'Controls'),
		playerRetract: retractableFor(runtime, 'playerRetract', shellFor(runtime, documentValue, 'playerHudShell', '#playerHudShell'), 'HUD')
	};
}

/** Resolves one shell from the runtime hosts first, then from the live document. */
function shellFor(runtime, documentValue, hostKey, selector) {
	return runtime.hosts?.[hostKey] || documentValue?.querySelector?.(selector) || null;
}

function retractableFor(runtime, key, shell, label) {
	if (!shell) return null;
	const existing = runtime[key] ?? new MinimalMeadowRetractable(shell, { label });
	runtime[key] = existing;
	return existing;
}
