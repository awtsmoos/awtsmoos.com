// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootProgressOverlay.js
 * @description Publishes boot text through the existing menu vessel without compositor effects.
 * The Awtsmoos needs no second veil above the living canvas; Awtsmoos.com schedules one finite
 * text update and never injects blur, gradients, containment, animation, or an overlay tree.
 */

let pendingSnapshot = null;
let scheduled = false;

export function scheduleBootProgress(snapshot, environment = globalThis) {
	pendingSnapshot = snapshot;
	if (scheduled) return;
	scheduled = true;
	const schedule = environment.setTimeout?.bind(environment)
		|| globalThis.setTimeout?.bind(globalThis);
	if (!schedule) {
		flushBootProgress(environment.document);
		return;
	}
	schedule(() => flushBootProgress(environment.document), 0);
}

export function renderBootProgress(snapshot, documentValue = globalThis.document) {
	const root = documentValue?.documentElement;
	const boot = documentValue?.getElementById?.('menuBoot');
	if (!root || !boot) return;
	boot.dataset.bootState = snapshot.current;
	if (snapshot.current === 'ready') {
		boot.style.display = 'none';
		return;
	}
	boot.style.removeProperty?.('display');
	const status = boot.querySelector?.('span') || boot.lastElementChild;
	if (status) status.textContent = bootMessage(snapshot);
	boot.setAttribute?.('aria-label', bootMessage(snapshot));
}

function flushBootProgress(documentValue) {
	const snapshot = pendingSnapshot;
	pendingSnapshot = null;
	scheduled = false;
	if (snapshot) renderBootProgress(snapshot, documentValue);
}

function bootMessage(snapshot) {
	if (snapshot.failure) return `Startup failed: ${snapshot.failure.message}`;
	const latest = snapshot.progress.at(-1);
	if (latest?.detail) return latest.detail;
	return String(snapshot.current || 'preparing').replace(/-/g, ' ');
}
