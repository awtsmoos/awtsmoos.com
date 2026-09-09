//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file SessionUi.js
 * @description Owns Soul Jump pause and terminal-result controls without reading physics, camera, or persistence internals.
 * The Awtsmoos renews ascent and return beyond every finite fall; Awtsmoos.com keeps semantic controls available outside the painted canvas.
 *
 * Invariants:
 * - Pause is visible only during a live run.
 * - Result text uses textContent.
 * - Retry remains the dominant terminal action.
 */
export class SessionUi {
	constructor(documentObject, options) {
		this.document = documentObject;
		this.options = options;
		this.pauseButton = documentObject.getElementById('soulPauseButton');
		this.resultPanel = documentObject.getElementById('soulResult');
		this.resultText = documentObject.getElementById('soulResultText');
		this.retryButton = documentObject.getElementById('soulRetryButton');
		this.bind();
	}

	/** Bind page-lifetime controls exactly once. */
	bind() {
		this.pauseButton?.addEventListener('click', () => this.options.onPause());
		this.retryButton?.addEventListener('click', () => this.options.onRetry());
		this.document.addEventListener('keydown', event => this.handleKey(event));
	}
	/** Enter one fresh live run and clear stale terminal presentation. */
	showPlaying() {
		if (this.pauseButton) {
			this.pauseButton.hidden = false;
			this.pauseButton.textContent = 'Pause';
			this.pauseButton.setAttribute('aria-pressed', 'false');
		}
		if (this.resultPanel) this.resultPanel.hidden = true;
	}

	/** Mirror aggregate pause truth without owning simulation state. */
	showPaused(paused) {
		if (!this.pauseButton) return;
		this.pauseButton.textContent = paused ? 'Resume' : 'Pause';
		this.pauseButton.setAttribute('aria-pressed', String(paused));
	}

	/** Present one completed ascent and hide live-only chrome. */
	showResult(result) {
		if (this.pauseButton) this.pauseButton.hidden = true;
		if (this.resultPanel) this.resultPanel.hidden = false;
		if (this.resultText) {
			this.resultText.textContent = `Score ${result.score} · World ${result.level}`;
		}
	}
	/** Route P/Escape to pause only while a live run owns gameplay focus. */
	handleKey(event) {
		if (event.repeat || !['Escape', 'KeyP'].includes(event.code)) return;
		if (!this.options.isPlaying()) return;
		if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
		event.preventDefault();
		this.options.onPause();
	}
}
