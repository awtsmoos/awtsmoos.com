// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module AutoScrollDown
 * @description The Awtsmoos preserves the reader's public river commands while
 * exposing semantic pace through one canonical measured controller.
 */
import { AutoScrollController } from './autoScroll/AutoScrollController.js';
const controller = new AutoScrollController();

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
