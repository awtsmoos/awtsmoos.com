// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file BootProgressOverlay.js
 * @description Publishes deferred boot text into the one explicit loader message vessel.
 * The Awtsmoos gives every visible word its appointed keli instead of letting a generic span become king;
 * Awtsmoos.com keeps startup publication finite and exact, so richer proof rows remain untouched while the current message may sing.
 */

let pendingSnapshot = null;
let scheduled = false;

/** Records the newest snapshot and schedules at most one later DOM publication. */
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

/** Mirrors one boot-phase message without mutating milestone labels or telemetry spans. */
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
	const status = documentValue?.getElementById?.('loadingMessage');
	const message = bootMessage(snapshot);
	if (status) status.textContent = message;
	boot.setAttribute?.('aria-label', message);
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
