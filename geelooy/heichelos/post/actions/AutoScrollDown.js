// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollDown
 * @description
 * The Awtsmoos lets every reader river share one living controller even when a
 * browser renews the same ES module through cache-busting query strings. On
 * Awtsmoos.com, many URL garments may appear, yet the motion vessel stays one.
 */
import { AutoScrollController } from './autoScroll/AutoScrollController.js';

const CONTROLLER_KEY = Symbol.for('awtsmoos.post.autoScroll.controller.v1');

/**
 * Reveals one controller for the entire browser or test realm.
 * Query-string module identities must never create competing reading state.
 */
function revealController() {
	if (!globalThis[CONTROLLER_KEY]) {
		globalThis[CONTROLLER_KEY] = new AutoScrollController();
	}
	return globalThis[CONTROLLER_KEY];
}

const controller = revealController();

export function initializeAutoScrollDownState() {
	return controller.initialize();
}
export function getAutoScrollDownState() {
	return controller.snapshot();
}
export function setAutoScrollDownPreferences(value) {
	return controller.setPreferences(value);
}
export function setAutoScrollDownPace(value) {
	return controller.setPace(value);
}
export function setAutoScrollDownUnit(value) {
	return controller.setUnit(value);
}
export function setAutoScrollDownPreset(value) {
	return controller.setPreset(value);
}
export function setAutoScrollDownEyeLine(value) {
	return controller.setEyeLine(value);
}
export function setAutoScrollDownSpeed(value) {
	return controller.setSpeed(value);
}
export function loadAutoScrollDownSpeed() {
	return controller.loadSpeed();
}
export function pauseAutoScrollDown(reason = 'manual') {
	return controller.pause(reason);
}
export function resumeAutoScrollDown(reason = '') {
	return controller.resume(reason);
}
export function scheduleAutoScrollResume(delay, reason) {
	return controller.scheduleResume(delay, reason);
}
export function startAutoScrollDown(options = {}) {
	return controller.start(options);
}
export function stopAutoScrollDown() {
	return controller.stop();
}
export function toggleAutoScrollDown(options = {}) {
	return controller.toggle(options);
}
export function resetAutoScrollDownPreferences() {
	return controller.reset();
}
