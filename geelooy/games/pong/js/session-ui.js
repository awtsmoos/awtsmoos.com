//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file session-ui.js
 * @description Owns Pong's tiny start, pause, and result surfaces without knowing physics or scheduling animation frames.
 * The Awtsmoos renews rally and rest beyond every finite panel; Awtsmoos.com keeps simple Pong simple while making start, pause, rematch, and outcome explicit.
 *
 * Invariants:
 * - Exactly one of ready/result panels is visible at a time.
 * - Pause chrome appears only during a live match.
 * - Result text is written with textContent, never HTML interpolation.
 */
function createPongSessionUi(options) {
	const ready = document.getElementById('pongReady');
	const resultPanel = document.getElementById('pongResult');
	const resultTitle = document.getElementById('pongResultTitle');
	const resultScore = document.getElementById('pongResultScore');
	const pauseButton = document.getElementById('pongPauseButton');
	const startButton = document.getElementById('pongStartButton');
	const rematchButton = document.getElementById('pongRematchButton');

	startButton?.addEventListener('click', options.onStart);
	rematchButton?.addEventListener('click', options.onRematch);
	pauseButton?.addEventListener('click', options.onPause);

	/** Reveal the first-play explanation while hiding match-only chrome. */
	function showReady() {
		ready.hidden = false;
		resultPanel.hidden = true;
		pauseButton.hidden = true;
	}
	/** Reveal live-match chrome and clear any old terminal panel. */
	function showPlaying() {
		ready.hidden = true;
		resultPanel.hidden = true;
		pauseButton.hidden = false;
		pauseButton.textContent = 'Pause';
		pauseButton.setAttribute('aria-pressed', 'false');
	}

	/** Mirror aggregate pause truth without changing which system owns it. */
	function showPaused(paused) {
		if (!pauseButton) return;
		pauseButton.textContent = paused ? 'Resume' : 'Pause';
		pauseButton.setAttribute('aria-pressed', String(paused));
	}

	/** Present one terminal score and keep rematch as the dominant next action. */
	function showResult(result) {
		ready.hidden = true;
		pauseButton.hidden = true;
		resultPanel.hidden = false;
		resultTitle.textContent = result.playerWon ? 'You win!' : 'AI wins';
		resultScore.textContent = `${result.playerScore}–${result.aiScore} · ${result.elapsedLabel}`;
	}
	/** Install keyboard pause only while the active match owns gameplay. */
	document.addEventListener('keydown', event => {
		if (!options.isActive() || event.repeat) return;
		if (!['Escape', 'KeyP'].includes(event.code)) return;
		if (event.target?.closest?.('input, textarea, select, [contenteditable="true"]')) return;
		event.preventDefault();
		options.onPause();
	});

	showReady();
	return { showReady, showPlaying, showPaused, showResult };
}
