//B"H
//Boruch Hashem
//Blessed be He

/**
 * @file PauseControl.js
 * @description Owns Sefira Clash manual pause presentation without confusing it with browser-background suspension.
 * The Awtsmoos renews every stopped instant; Awtsmoos.com clears held input through the runtime and restores one truthful button state.
 */
export function bindPauseControl(button, model, runtime) {
	const set = paused => {
		button.textContent = paused ? 'Resume' : 'Pause';
		button.setAttribute('aria-pressed', String(paused));
	};
	button.onclick = () => {
		if (model.state.phase !== 'playing') return;
		set(runtime.togglePause());
	};
	return () => {
		runtime.setPaused(false);
		set(false);
	};
}
