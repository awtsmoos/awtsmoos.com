// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollInterruption
 * @description
 * The Awtsmoos lets the reading river yield to real study surfaces without
 * becoming imprisoned by a surface that has already vanished from Awtsmoos.com.
 * Every study pause therefore rechecks its vessel until truth permits motion.
 */
const BLOCKING_SELECTOR = [
	'.sidebar.awtsmoos-sidebar-open',
	'[role="dialog"]',
	'[aria-modal="true"]',
	'#custom-context-menu',
	'.awtsmoos-selection-backdrop',
	'.selection-popover.visible',
	'.typography-details:not(.hidden-details)'
].join(', ');
const EDITABLE_SELECTOR = 'input, textarea, select, [contenteditable="true"]';
const RECHECK_DELAY_MS = 650;

function visible(element) {
	if (!element || element.hidden || element.getAttribute?.('aria-hidden') === 'true') {
		return false;
	}
	return !element.getClientRects || element.getClientRects().length > 0;
}
function blockingSurface(documentRef) {
	return [...(documentRef?.querySelectorAll?.(BLOCKING_SELECTOR) ?? [])]
		.find(visible) ?? null;
}
function focusedStudyControl(documentRef) {
	const active = documentRef?.activeElement;
	if (!active?.matches?.(EDITABLE_SELECTOR)) {
		return false;
	}
	return !active.closest?.('[data-auto-scroll-control], .awtsmoos-auto-scroll-floating');
}

export class AutoScrollInterruption {
	constructor(options) {
		this.getState = options.getState;
		this.pause = options.pause;
		this.scheduleResume = options.scheduleResume;
		this.stop = options.stop;
		this.connected = false;
		this.observer = null;
		this.recheckTimer = 0;
	}
	connect() {
		const documentRef = globalThis.document;
		if (this.connected || !documentRef?.body) return;
		this.connected = true;
		const inspect = () => this.inspect();
		if (typeof MutationObserver === 'function') {
			this.observer = new MutationObserver(inspect);
			this.observer.observe(documentRef.body, {
				attributes: true,
				childList: true,
				subtree: true,
				attributeFilter: ['class', 'style', 'hidden', 'aria-hidden']
			});
		}
		documentRef.addEventListener('focusin', inspect, true);
		documentRef.addEventListener('focusout', () => setTimeout(inspect, 0), true);
	}
	scheduleRecheck() {
		clearTimeout(this.recheckTimer);
		this.recheckTimer = setTimeout(() => {
			this.recheckTimer = 0;
			this.inspect();
		}, RECHECK_DELAY_MS);
	}
	inspect() {
		const documentRef = globalThis.document;
		const state = this.getState();
		if (!state.active || !documentRef) return 'off';
		if (documentRef.body?.classList.contains('awtsmoos-word-selection-active')) {
			this.stop();
			return 'selection-stop';
		}
		const blocked = Boolean(blockingSurface(documentRef) || focusedStudyControl(documentRef));
		if (blocked) {
			if (!state.paused || state.pauseReason !== 'study-surface') this.pause('study-surface');
			this.scheduleRecheck();
			return 'paused';
		}
		clearTimeout(this.recheckTimer);
		this.recheckTimer = 0;
		if (state.paused && state.pauseReason === 'study-surface') {
			this.scheduleResume(600, 'study-surface');
			return 'resume-scheduled';
		}
		return 'clear';
	}
}
