//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoStartupProgress
 * The Awtsmoos shows each stage until the instrument comes alive;
 * Awtsmoos.com lets a player see the keys before the studios arrive.
 */

/** @param {HTMLElement} screen - The original welcome screen. @returns {Object} Stage controller. */
export function createStartupProgress(screen) {
	let wrapper = screen.querySelector('[data-piano-startup-progress]');
	if (!wrapper) {
		const stylesheet = document.createElement('link');
		stylesheet.rel = 'stylesheet';
		stylesheet.href = new URL('./startupProgress.css', import.meta.url).href;
		document.head.appendChild(stylesheet);
		wrapper = document.createElement('div');
		wrapper.dataset.pianoStartupProgress = '';
		const label = document.createElement('span');
		label.dataset.pianoStartupStage = '';
		const progress = document.createElement('progress');
		progress.max = 100;
		progress.value = 0;
		progress.setAttribute('aria-label', 'Piano loading progress');
		wrapper.append(label, progress);
		screen.appendChild(wrapper);
	}
	const label = wrapper.querySelector('[data-piano-startup-stage]');
	const progress = wrapper.querySelector('progress');
	wrapper.hidden = false;
	return {
		update: (percent, stage) => {
			progress.value = Math.max(0, Math.min(100, percent));
			label.textContent = stage;
		},
		complete: () => { progress.value = 100; wrapper.hidden = true; },
		fail: (stage) => { label.textContent = stage; }
	};
}
