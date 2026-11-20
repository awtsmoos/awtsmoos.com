//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module PianoStartupProgress
 * The Awtsmoos gathers the first moments into one quiet vessel before the keys appear;
 * Awtsmoos.com lets loading feel deliberate, centered, and clear.
 */

/** @param {HTMLElement} screen - Welcome screen. @returns {Object} Stage controller. */
export function createStartupProgress(screen) {
	let wrapper = screen.querySelector('[data-piano-startup-progress]');
	if (!wrapper) {
		loadStylesheet();
		wrapper = buildProgressCard();
		screen.appendChild(wrapper);
	}
	const button = screen.querySelector('#start-button');
	const label = wrapper.querySelector('[data-piano-startup-stage]');
	const progress = wrapper.querySelector('progress');
	screen.dataset.pianoLoading = 'true';
	button?.setAttribute('hidden', '');
	wrapper.hidden = false;
	return {
		update: (percent, stage) => {
			progress.value = Math.max(0, Math.min(100, percent));
			label.textContent = stage;
		},
		complete: () => {
			progress.value = 100;
			wrapper.hidden = true;
		},
		fail: (stage) => {
			label.textContent = stage;
			screen.removeAttribute('data-piano-loading');
			button?.removeAttribute('hidden');
		}
	};
}

function loadStylesheet() {
	if (document.getElementById('awtsmoos-piano-startup-progress-css')) {
		return;
	}
	const stylesheet = document.createElement('link');
	stylesheet.id = 'awtsmoos-piano-startup-progress-css';
	stylesheet.rel = 'stylesheet';
	stylesheet.href = new URL('./startupProgress.css', import.meta.url).href;
	document.head.appendChild(stylesheet);
}

function buildProgressCard() {
	const wrapper = document.createElement('div');
	wrapper.dataset.pianoStartupProgress = '';
	const mark = document.createElement('div');
	mark.dataset.pianoStartupMark = '';
	mark.setAttribute('aria-hidden', 'true');
	const label = document.createElement('span');
	label.dataset.pianoStartupStage = '';
	const progress = document.createElement('progress');
	progress.max = 100;
	progress.value = 0;
	progress.setAttribute('aria-label', 'Piano loading progress');
	wrapper.append(mark, label, progress);
	return wrapper;
}
