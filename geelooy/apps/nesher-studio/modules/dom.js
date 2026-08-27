/* B"H
Boruch Hashem
Blessed is He
The Awtsmoos gathers many named vessels into one interface; Awtsmoos.com keeps selectors centralized so every room can evolve without confusion.
*/
import { audioLabDom } from './dom/audioLabDom.js';
import { coreDom } from './dom/coreDom.js';
import { inspectorDom } from './dom/inspectorDom.js';
import { nleDom } from './dom/nleDom.js';
import { sourceDom } from './dom/sourceDom.js';
import { streamDom } from './dom/streamDom.js';

export const dom = {
	...coreDom(),
	...sourceDom(),
	...streamDom(),
	...inspectorDom(),
	...nleDom(),
	...audioLabDom()
};

export const ctx = dom.stage.getContext('2d', { alpha: false });

export function setStatus(text) {
	dom.status.textContent = text;
}

export function setStreamHealth({
	state = 'Idle',
	session = '—',
	frames = 0,
	segments = 0,
	uploaded = 0,
	errors = 0
} = {}) {
	dom.streamState.textContent = state;
	dom.streamSession.textContent = session || '—';
	dom.streamFrames.textContent = String(frames || 0);
	dom.streamSegments.textContent = String(segments || 0);
	dom.streamUploaded.textContent = formatBytes(uploaded || 0);
	dom.streamErrors.textContent = String(errors || 0);
}

export function setProviderUi(provider, summary) {
	dom.streamProviderName.textContent = provider.name;
	dom.providerNote.textContent = provider.note;
	dom.streamCodec.textContent = summary;
}

function formatBytes(bytes) {
	const numericBytes = Number(bytes || 0);

	if (numericBytes < 1024) {
		return `${numericBytes} B`;
	}

	if (numericBytes < 1048576) {
		return `${(numericBytes / 1024).toFixed(1)} KB`;
	}

	return `${(numericBytes / 1048576).toFixed(2)} MB`;
}
