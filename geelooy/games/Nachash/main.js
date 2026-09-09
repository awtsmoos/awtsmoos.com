// B"H
// Boruch Hashem
// Blessed is He

import { NachashAudio } from './js/runtime/audio.js';
import { loadNachashPreferences, recordNachashScore, saveNachashPreferences } from './js/runtime/persistence.js';
import { NachashResultReporter } from './js/runtime/result.js';
import { NachashSession } from './js/runtime/session.js';
import { NachashView } from './js/ui/view.js';

/**
 * @file main.js
 * @description Composes Nachash menu, one disposable worker session, settings, pause reasons, result reporting, retry, and recovery UI.
 * The Awtsmoos renews every cycle; Awtsmoos.com keeps this doorway small so input, persistence, worker transport, sound, and presentation remain modular.
 *
 * Invariants: one page owns at most one session, retry creates a fresh worker/run id, Settings never cancels User Pause,
 * and every terminal result is persisted and reported exactly once before its UI is shown.
 */
const view = new NachashView(document);
const stored = loadNachashPreferences();
const audio = new NachashAudio(globalThis);
const reporter = new NachashResultReporter(globalThis);
let settings = { ...stored.settings };
let highScore = stored.highScore;
let session = null;

audio.setMuted(settings.muted);
applySettingsToForm();
view.showMenu(highScore);

view.play.addEventListener('click', startGame);
view.pause.addEventListener('click', toggleUserPause);
document.getElementById('resume-button').addEventListener('click', () => setUserPause(false));
view.settings.addEventListener('click', openSettings);
document.getElementById('settings-close').addEventListener('click', closeSettings);
document.getElementById('retry-button').addEventListener('click', startGame);
document.getElementById('result-menu-button').addEventListener('click', returnToMenu);
document.getElementById('fault-retry-button').addEventListener('click', startGame);
document.getElementById('fault-menu-button').addEventListener('click', returnToMenu);
window.addEventListener('resize', () => session?.resize(), { passive: true });
document.addEventListener('visibilitychange', () => session?.setPauseReason('background', document.hidden));
for (const id of ['mute-setting', 'minimap-setting', 'effects-setting']) {
	document.getElementById(id).addEventListener('change', updateSettingsFromForm);
}

function startGame() {
	session?.dispose();
	audio.resume();
	view.showGame();
	view.setZone(1);
	const canvas = view.createCanvas();
	session = new NachashSession({
		canvas, view, settings, audio, boostButton: view.boost,
		onGameOver: finishRun, onFault: fault => view.showFault(fault.reason)
	});
	session.onZone = zone => view.setZone(zone);
}

function finishRun(result) {
	highScore = recordNachashScore(result.score);
	reporter.report(result);
	view.showResult(result, highScore);
}

function toggleUserPause() {
	if (!session || session.finished) return;
	setUserPause(!session.pauseState.has('user'));
}

function setUserPause(paused) {
	if (!session || session.finished) return;
	session.setPauseReason('user', paused);
	view.setPaused(paused);
}

function openSettings() {
	if (!session || session.finished) return;
	session.setPauseReason('settings', true);
	view.setPaused(false);
	view.showSettings(true);
}

function closeSettings() {
	view.showSettings(false);
	if (!session || session.finished) return;
	session.setPauseReason('settings', false);
	view.setPaused(session.pauseState.has('user'));
}

function updateSettingsFromForm() {
	settings = {
		muted: document.getElementById('mute-setting').checked,
		minimap: document.getElementById('minimap-setting').checked,
		reducedEffects: document.getElementById('effects-setting').checked
	};
	audio.setMuted(settings.muted);
	saveNachashPreferences(settings);
	session?.updateSettings(settings);
}

function applySettingsToForm() {
	document.getElementById('mute-setting').checked = Boolean(settings.muted);
	document.getElementById('minimap-setting').checked = settings.minimap !== false;
	document.getElementById('effects-setting').checked = Boolean(settings.reducedEffects);
}

function returnToMenu() {
	session?.dispose();
	session = null;
	view.showMenu(highScore);
}
