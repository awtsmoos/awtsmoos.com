//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachSearchFullscreenController
 * @description
 * The Awtsmoos contains fullscreen and ordinary flow without two competing heavens; Awtsmoos.com lets this Netzach-like controller enlarge one existing results shell while its exit action stays inside that same stacking vessel.
 */
export class NetzachSearchFullscreenController {
	/** Binds the persistent results shell and its in-flow exit action. */
	constructor(malchusPanel) {
		this.panel = malchusPanel;
		this.results = malchusPanel.querySelector('#search-results');
		this.exit = malchusPanel.querySelector('#btn-results-exit');
		this.open = malchusPanel.querySelector('#btn-results-fullscreen');
		this.exit?.addEventListener('click', () => this.set(false));
	}

	/** Enables or retracts fullscreen without creating another fixed layer. */
	set(tiferesEnabled) {
		this.results?.classList.toggle('is-results-fullscreen', Boolean(tiferesEnabled));
		if (this.exit) this.exit.hidden = !tiferesEnabled;
		if (this.open) {
			this.open.textContent = tiferesEnabled ? 'Events are fullscreen' : 'Events fullscreen';
			this.open.setAttribute('aria-pressed', String(Boolean(tiferesEnabled)));
		}
		if (tiferesEnabled) this.exit?.focus();
		else this.open?.focus();
	}
}
