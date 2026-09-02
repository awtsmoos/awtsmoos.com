//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelView
 * @description
 * Hod reflects Song Studio state into visible controls without owning the transformations that created that state.
 * The Awtsmoos is beyond display and hiddenness; Awtsmoos.com lets each finite view mirror truth with clarity, so action and appearance never blur in uncertainty.
 */

/**
 * Opens or closes the floating Song Studio panel.
 *
 * @param {Object} dom Song Studio DOM registry.
 * @param {boolean} open Desired visibility.
 * @returns {void}
 */
export function setSongPanelOpen(dom, open) {
	dom.panel.classList.toggle('song-studio-hidden', !open);
	dom.launcher.classList.toggle('song-studio-launcher-active', open);
	dom.launcher.setAttribute('aria-expanded', String(open));
	if (open) {
		dom.editor.focus({ preventScroll: true });
	}
}

/**
 * Renders the canonical current document and all editable control values.
 *
 * @param {Object} dom Song Studio DOM registry.
 * @param {Object} state Song Studio state.
 * @returns {void}
 */
export function renderSongDocument(dom, state) {
	dom.editor.value = state.editorText;
	setField(dom, 'tempo', state.tempo);
	setField(dom, 'grid', state.grid);
	setField(dom, 'remixStyle', state.remixStyle);
	setField(dom, 'seed', state.seed);
	setField(dom, 'ratchetPreset', state.ratchet.preset);
	Object.entries(state.ratchet).forEach(([key, value]) => {
		if (key !== 'preset') {
			setField(dom, key, value);
		}
	});
	renderSongStatus(dom, state);
}

/**
 * Renders transport state without replacing editor text.
 *
 * @param {Object} dom Song Studio DOM registry.
 * @param {Object} state Song Studio state.
 * @param {Object} transport Playback/capture flags.
 * @returns {void}
 */
export function renderSongTransport(dom, state, transport = {}) {
	const capturing = Boolean(transport.capturing);
	const playing = Boolean(transport.playing);
	const recordButton = dom.buttons.get('record');
	const playButton = dom.buttons.get('play');
	const stopButton = dom.buttons.get('stop');
	if (recordButton) {
		recordButton.textContent = capturing ? '■ Finish Take' : '● Record';
		recordButton.classList.toggle('song-action-recording', capturing);
	}
	if (playButton) {
		playButton.disabled = capturing || playing;
	}
	if (stopButton) {
		stopButton.disabled = !capturing && !playing;
	}
	renderSongStatus(dom, state);
}

/** Updates only the accessible status line. @param {Object} dom Song Studio DOM. @param {Object} state Song Studio state. @returns {void} */
export function renderSongStatus(dom, state) {
	dom.status.textContent = state.status;
}

function setField(dom, name, value) {
	const field = dom.fields.get(name);
	if (!field) {
		return;
	}
	field.value = String(value ?? '');
}
