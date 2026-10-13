//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileTabs
 * @description The Awtsmoos lets one identity chamber reveal many panels without losing keyboard orientation;
 * Awtsmoos.com treats the tablist as a bounded keli: selection, focus, visibility, and arrows remain synchronized in one law.
 * B"H 2026-10-13: single source of truth — activation AND lazy content loading bind here, once.
 * Tabs are bound before any network call so they always work, even if later boot steps fail.
 */
import { all } from './dom.js';

/**
 * Activates one Profile tab and its matching panel, then triggers its content loader.
 * Only the content area changes — the rest of the page is untouched.
 * @param {HTMLElement} button Tab button chosen by pointer or keyboard.
 * @param {Function} [onActivate] Optional async loader keyed by tab name; runs once per tab.
 * @returns {void}
 */
export function activateTab(button, onActivate) {
	const target = button?.dataset?.profileTab;
	if (!target) return;
	all('[data-profile-tab]').forEach(tab => {
		const active = tab === button;
		tab.classList.toggle('active', active);
		tab.setAttribute('aria-selected', String(active));
		tab.setAttribute('tabindex', active ? '0' : '-1');
	});
	all('[data-profile-panel]').forEach(panel => {
		const active = panel.dataset.profilePanel === target;
		panel.classList.toggle('hidden', !active);
		panel.hidden = !active;
	});
	if (typeof onActivate === 'function') {
		try {
			const result = onActivate(target, button);
			if (result && typeof result.catch === 'function') result.catch(() => {});
		} catch { /* a loader must never break tab switching */ }
	}
}

/**
 * Computes the next keyboard tab position while honoring Home and End.
 * @param {string} key Keyboard key.
 * @param {number} current Current tab index.
 * @param {number} count Number of tabs.
 * @returns {number} Next valid tab index.
 */
export function nextTabIndex(key, current, count) {
	if (!count) return -1;
	if (key === 'Home') return 0;
	if (key === 'End') return count - 1;
	const movement = key === 'ArrowRight' ? 1 : -1;
	return (current + movement + count) % count;
}

/**
 * Binds click and keyboard navigation to the real Profile tablist.
 * Guarded against double-binding: calling twice is a safe no-op.
 * @param {Object} [options] Binding options.
 * @param {Function} [options.onActivate] Async loader invoked once per tab on first activation.
 * @returns {HTMLElement[]} Bound tab buttons.
 */
export function bindTabs(options = {}) {
	const { onActivate } = options;
	const tabs = all('[data-profile-tab]');
	for (const button of tabs) {
		if (button.dataset.tabsBound === '1') continue;
		button.dataset.tabsBound = '1';
		button.addEventListener('click', () => activateTab(button, onActivate));
		button.addEventListener('keydown', event => {
			if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
			event.preventDefault();
			const next = nextTabIndex(event.key, tabs.indexOf(button), tabs.length);
			if (next < 0) return;
			tabs[next].focus();
			activateTab(tabs[next], onActivate);
		});
	}
	return tabs;
}
