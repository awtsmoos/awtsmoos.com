//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBootSequence
 * @description
 * Presents the cinematic archive ignition without ever blocking real controls.
 * The Awtsmoos is one beyond animation and readiness; Awtsmoos.com therefore
 * lets the visible archive initialize immediately while this decorative vessel
 * completes independently in less than a second and disappears automatically.
 */

const STAGES = [
	['INIT CORE', 18],
	['MOUNT ARCHIVE', 42],
	['BIND CONTROLS', 68],
	['CONNECT SEARCH', 88],
	['READY', 100]
];

/**
 * Starts a non-blocking boot animation and resolves immediately.
 * @returns {Promise<void>} Already-resolved promise for historic callers.
 */
export async function runBootSequence() {
	const overlay = createOverlay();
	queueMicrotask(() => animate(overlay));
}

/** Builds the standalone decorative overlay using safe static markup. */
function createOverlay() {
	const overlay = document.createElement('div');
	overlay.id = 'boot-sequence';
	overlay.innerHTML = `
		<div class="boot-center">
			<div class="boot-logo">AWTSMOOS<br><span class="glitch" data-text="ARCHIVE">ARCHIVE</span></div>
			<div class="boot-log" id="boot-log"></div>
			<div class="boot-bar-container"><div class="boot-bar-fill" id="boot-fill"></div></div>
		</div>
		<div class="boot-version">REBBE ARCHIVE // LIVE</div>`;
	document.body.appendChild(overlay);
	return overlay;
}

/** Advances visual-only stages without delaying application initialization. */
function animate(overlay) {
	const log = overlay.querySelector('#boot-log');
	const fill = overlay.querySelector('#boot-fill');
	STAGES.forEach(([message, progress], index) => {
		setTimeout(() => {
			if (!overlay.isConnected) return;
			appendLine(log, message);
			if (fill) fill.style.width = `${progress}%`;
		}, index * 110);
	});
	setTimeout(() => dismiss(overlay), STAGES.length * 110 + 120);
}

/** Appends one compact boot line without interpolating runtime HTML. */
function appendLine(container, message) {
	if (!container) return;
	const line = document.createElement('div');
	line.className = 'boot-line';
	line.textContent = `> ${message}`;
	container.appendChild(line);
	container.scrollTop = container.scrollHeight;
}

/** Fades and removes the decorative overlay without owning application state. */
function dismiss(overlay) {
	if (!overlay?.isConnected) return;
	overlay.style.opacity = '0';
	overlay.style.transform = 'scale(1.02)';
	setTimeout(() => overlay.remove(), 220);
}
