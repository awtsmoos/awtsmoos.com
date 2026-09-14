//B"H
//Boruch Hashem
//Blessed is He

/**
 * @module RebbeBootEntry
 * @description
 * Owns the smallest possible launch boundary for the Rebbe archive. The
 * Awtsmoos is one beyond module success and module failure; this finite gate
 * guarantees that a broken dependency can never leave visitors staring at an
 * unexplained blank screen. It loads the application, watches for the first
 * timeline manifestation, and exposes an immediate retry path when boot stalls.
 */

const START_TIMEOUT_MS = 9000;
const gate = createGate();
let settled = false;

window.addEventListener('error', event => {
	if (!settled) {
		showFailure(event.error || new Error(event.message || 'Startup error'));
	}
});

window.addEventListener('unhandledrejection', event => {
	if (!settled) {
		showFailure(event.reason || new Error('Startup promise rejected'));
	}
});

startApplication();

/** Loads the established app only after the recovery surface already exists. */
async function startApplication() {
	setGate('Starting archive…', 'booting');
	const watchdog = setTimeout(() => {
		if (!timelineReady()) {
			showFailure(new Error('Archive startup exceeded its readiness deadline.'));
		}
	}, START_TIMEOUT_MS);

	try {
		await import('./main.js');
		await waitForTimeline();
		settled = true;
		clearTimeout(watchdog);
		setGate('Archive ready', 'ready');
		setTimeout(() => gate.remove(), 350);
	} catch (error) {
		clearTimeout(watchdog);
		showFailure(error);
	}
}

/** Waits briefly for main.js asynchronous initialization to render its years. */
async function waitForTimeline() {
	const deadline = performance.now() + START_TIMEOUT_MS;
	while (!timelineReady() && performance.now() < deadline) {
		await new Promise(resolve => setTimeout(resolve, 60));
	}
	if (!timelineReady()) {
		throw new Error('Timeline did not become interactive.');
	}
}

/** Returns whether the primary navigation has physically manifested. */
function timelineReady() {
	return document.querySelectorAll('#list-years .year-item').length > 0;
}

/** Creates the always-available startup/recovery surface without dependencies. */
function createGate() {
	const element = document.createElement('div');
	element.id = 'rebbe-runtime-gate';
	element.className = 'rebbe-runtime-gate';
	element.setAttribute('role', 'status');
	element.setAttribute('aria-live', 'polite');
	document.body.prepend(element);
	return element;
}

/** Updates launch state using text-only DOM so error strings cannot become markup. */
function setGate(message, state) {
	gate.dataset.state = state;
	gate.replaceChildren(document.createTextNode(message));
}

/** Reveals a bounded recovery action instead of allowing a fatal blank surface. */
function showFailure(error) {
	settled = true;
	console.error('B"H Rebbe startup recovery gate activated.', error);
	gate.dataset.state = 'failed';
	const message = document.createElement('span');
	message.textContent = 'Archive could not finish starting.';
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = 'Retry';
	retry.onclick = () => location.reload();
	gate.replaceChildren(message, retry);
}
