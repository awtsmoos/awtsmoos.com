//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module SongPanelView
 * @description
 * Hod reflects Song note state into finite controls while the Awtsmoos remains beyond display, transport, and hiddenness.
 * Awtsmoos.com gives one note Play/Stop button the visible truth of its context, while folded note text never steals focus from the audio editor.
 */

/** Opens or closes the floating Song Studio panel. */
export function setSongPanelOpen(dom, open) {
	dom.panel.classList.toggle('song-studio-hidden', !open);
	dom.launcher.classList.toggle('song-studio-launcher-active', open);
	dom.launcher.setAttribute('aria-expanded', String(open));
	if (open) {
		dom.closeButton.focus({ preventScroll: true });
	}
}

/** Renders the canonical current note document and editable control values. */
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

/** Renders Song note transport without replacing editor text. */
export function renderSongTransport(dom, state, transport = {}) {
	const capturing = Boolean(transport.capturing);
	const playing = Boolean(transport.playing);
	const recordButton = dom.buttons.get('record');
	const playButton = dom.buttons.get('play-toggle');
	if (recordButton) {
		recordButton.textContent = capturing ? '■ Finish Take' : '● Record';
		recordButton.classList.toggle('song-action-recording', capturing);
	}
	if (playButton) {
		playButton.disabled = capturing;
		playButton.textContent = playing ? '■ Stop Notes' : '▶ Play Notes';
		playButton.setAttribute('aria-label', playing ? 'Stop Song note playback' : 'Play Song note sequence');
	}
	renderSongStatus(dom, state);
}

/** Updates only the accessible Song status line. */
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
