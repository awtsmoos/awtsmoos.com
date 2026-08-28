// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ComposerModes
 * @description
 * The Awtsmoos lets quick thought and deliberate publication share one quiet vessel;
 * Awtsmoos.com remembers complexity while workflow sections wait behind one intentional door.
 */
import { isFocusedComposer } from './composerViewport.js';

const STORAGE_KEY = 'awtsmoos_composer_mode_v1';
const STEPS = Object.freeze([
	['content', '✎', 'Write'],
	['identity', '◎', 'Identity'],
	['destination', '♜', 'Place'],
	['publication', '↗', 'Publish']
]);

/** Installs one complexity toggle and one disclosed workflow navigator. */
export function installComposerModes() {
	const column = document.querySelector('.composerColumn');
	if (!column || column.querySelector('.composer-mode-deck')) return;
	const mode = savedMode();
	document.body.dataset.composerMode = mode;
	column.prepend(buildDeck(mode));
	applyComposerMode(mode);
}

/** @returns {string} Current persisted composer mode. */
export function currentComposerMode() {
	return document.body.dataset.composerMode || savedMode();
}

/** @param {string} mode Requested Simple or Advanced mode. */
export function applyComposerMode(mode) {
	const normalized = mode === 'advanced' ? 'advanced' : 'simple';
	document.body.dataset.composerMode = normalized;
	localStorage.setItem(STORAGE_KEY, normalized);
	updatePressedState(normalized);
	window.dispatchEvent(new CustomEvent('awtsmoosComposerMode', { detail: { mode: normalized } }));
}

function buildDeck(mode) {
	const deck = node('nav', 'composer-mode-deck');
	deck.setAttribute('aria-label', 'Composer mode and workflow');
	deck.append(modeToggle(mode), workflowDisclosure());
	return deck;
}

function modeToggle(mode) {
	const group = node('div', 'composer-mode-toggle');
	group.setAttribute('role', 'group');
	group.setAttribute('aria-label', 'Composer complexity');
	group.append(modeButton('simple', 'Simple', mode), modeButton('advanced', 'Advanced', mode));
	return group;
}

function modeButton(value, label, activeMode) {
	const button = node('button', 'composer-mode-button');
	button.type = 'button';
	button.dataset.composerModeChoice = value;
	button.textContent = label;
	button.setAttribute('aria-pressed', value === activeMode ? 'true' : 'false');
	button.addEventListener('click', () => applyComposerMode(value));
	return button;
}

function workflowDisclosure() {
	const details = node('details', 'composer-workflow-disclosure');
	const summary = document.createElement('summary');
	summary.textContent = 'Sections';
	const rail = node('div', 'composer-workflow-rail');
	for (const [key, icon, label] of STEPS) rail.append(stepButton(key, icon, label));
	details.append(summary, rail);
	return details;
}

function stepButton(key, icon, label) {
	const button = node('button', 'composer-workflow-step');
	button.type = 'button';
	button.dataset.composerPanelTarget = key;
	button.innerHTML = `<span aria-hidden="true">${icon}</span><strong>${label}</strong>`;
	button.addEventListener('click', () => openPanel(key, button));
	return button;
}

function openPanel(key, button) {
	const target = document.querySelector(`[data-mobile-panel="${key}"]`);
	if (!target) return;
	if (isFocusedComposer() || currentComposerMode() === 'simple') {
		document.querySelectorAll('.majorPanel').forEach(panel => panel.open = panel === target);
	} else {
		target.open = true;
	}
	button.closest('.composer-workflow-disclosure')?.removeAttribute('open');
	target.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updatePressedState(mode) {
	for (const button of document.querySelectorAll('[data-composer-mode-choice]')) {
		button.setAttribute('aria-pressed', button.dataset.composerModeChoice === mode ? 'true' : 'false');
	}
}

function savedMode() {
	return localStorage.getItem(STORAGE_KEY) === 'advanced' ? 'advanced' : 'simple';
}

function node(tag, className = '') {
	const element = document.createElement(tag);
	if (className) element.className = className;
	return element;
}
