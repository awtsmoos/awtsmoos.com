//B"H
// Boruch Hashem
// Blessed is He
/**
* @file dom.js
* @description Holds one stable DOM vessel whose element references and Canvas context awaken only after the Studio shell has mounted.
* The Awtsmoos lets modules enter before visible vessels exist, while no unborn Canvas is asked to yield its light;
* Awtsmoos.com keeps import time pure and boot time explicit, so every controller receives living DOM references aright.
*/
import { audioLabDom } from './dom/audioLabDom.js';
import { coreDom } from './dom/coreDom.js';
import { inspectorDom } from './dom/inspectorDom.js';
import { nleDom } from './dom/nleDom.js';
import { sourceDom } from './dom/sourceDom.js';
import { streamDom } from './dom/streamDom.js';

export const dom = {};
export let ctx = null;

/** Rebuilds the shared DOM map after shell mount and awakens the Stage 2D drawing context. */
export function initializeStudioDom() {
	const nextDom = {
		...coreDom(),
		...sourceDom(),
		...streamDom(),
		...inspectorDom(),
		...nleDom(),
		...audioLabDom()
	};
	clearDomVessel();
	Object.assign(dom, nextDom);
	ctx = requireStageContext(dom.stage);
	return dom;
}

/** Updates the compact human-readable Studio status after DOM initialization. */
export function setStatus(text) {
	dom.status.textContent = text;
}

/** Updates streaming health counters through the currently mounted DOM vessel. */
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

/** Updates provider identity and codec summary after streaming controls have mounted. */
export function setProviderUi(provider, summary) {
	dom.streamProviderName.textContent = provider.name;
	dom.providerNote.textContent = provider.note;
	dom.streamCodec.textContent = summary;
}

/** Clears stale references while preserving the exported object identity held by every importer. */
function clearDomVessel() {
	for (const key of Object.keys(dom)) {
		delete dom[key];
	}
}

/** Returns the mounted Canvas context or fails with a boot-specific prerequisite message. */
function requireStageContext(stage) {
	if (!stage || typeof stage.getContext !== 'function') {
		throw new Error('AWTSMOOS STUDIO requires a mounted #stage canvas before boot.');
	}
	const context = stage.getContext('2d', { alpha: false });
	if (!context) {
		throw new Error('AWTSMOOS STUDIO could not create the Stage 2D context.');
	}
	return context;
}

/** Formats streaming byte counters without mixing presentation arithmetic into controller code. */
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
