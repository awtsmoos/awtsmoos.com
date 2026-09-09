// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file view.js
 * @description Projects Nachash menu, gameplay controls, settings, pause, fault, zone, and terminal states without owning simulation truth.
 * The Awtsmoos renews every visible chamber; Awtsmoos.com keeps overlays mutually intelligible, focusable, and usable on narrow phones.
 *
 * Invariants: the canvas is generation-owned, terminal/fault states hide gameplay controls, and every blocking overlay exposes an explicit recovery action.
 */
export class NachashView {
	constructor(documentObject = document) {
		this.document = documentObject;
		for (const [key, id] of Object.entries(ids())) this[key] = documentObject.getElementById(id);
	}

	createCanvas() {
		this.stage.querySelector('canvas')?.remove();
		const canvas = this.document.createElement('canvas');
		canvas.id = 'gameCanvas';
		canvas.setAttribute('aria-label', 'Nachash playfield');
		this.stage.prepend(canvas);
		return canvas;
	}

	showMenu(highScore) {
		this.highScore.textContent = `Highest Rectification: ${highScore}`;
		this.menu.classList.remove('hidden');
		this.stage.classList.add('hidden');
		this.controls.classList.add('hidden');
		this.hidePanels();
	}

	showGame() {
		this.menu.classList.add('hidden');
		this.stage.classList.remove('hidden');
		this.controls.classList.remove('hidden');
		this.hidePanels();
	}

	setPaused(paused) {
		this.pause.textContent = paused ? 'Resume' : 'Pause';
		this.pausePanel.classList.toggle('hidden', !paused);
		if (paused) this.boost.setAttribute('aria-pressed', 'false');
	}

	showSettings(open) {
		this.settingsPanel.classList.toggle('hidden', !open);
		if (open) this.settingsPanel.querySelector('input')?.focus();
	}

	showResult(result, highScore) {
		this.controls.classList.add('hidden');
		this.hidePanels();
		this.final.textContent = `Score ${Math.floor(result.score)} · Zone ${result.zone} · Best ${highScore}`;
		this.gameOver.classList.remove('hidden');
		this.retry.focus();
	}

	showFault(reason) {
		this.controls.classList.add('hidden');
		this.hidePanels();
		this.faultReason.textContent = `The game engine could not start (${reason}).`;
		this.fault.classList.remove('hidden');
		this.faultRetry.focus();
	}

	setZone(zone) { this.zone.textContent = `Zone ${zone}`; }

	hidePanels() {
		for (const panel of [this.pausePanel, this.settingsPanel, this.gameOver, this.fault]) panel.classList.add('hidden');
	}
}

function ids() {
	return {
		menu: 'menu-container', stage: 'game-stage', highScore: 'highScoreDisplay', play: 'playButton',
		controls: 'game-controls', boost: 'boost-button', pause: 'pause-button', settings: 'settings-button',
		pausePanel: 'pause-panel', settingsPanel: 'settings-panel', gameOver: 'game-over-panel', final: 'final-score',
		zone: 'zone-status', retry: 'retry-button', fault: 'fault-panel', faultReason: 'fault-reason', faultRetry: 'fault-retry-button'
	};
}
