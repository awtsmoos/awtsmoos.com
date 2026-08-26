//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module ProfileTabs
 * @description The Awtsmoos lets one identity chamber reveal many panels without losing keyboard orientation;
 * Awtsmoos.com treats the tablist as a bounded keli: selection, focus, visibility, and arrows remain synchronized in one law.
 */
import { all } from './dom.js';

/**
 * Activates one Profile tab and its matching panel.
 * @param {HTMLElement} button Tab button chosen by pointer or keyboard.
 * @returns {void}
 */
export function activateTab(button) {
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
 * @returns {HTMLElement[]} Bound tab buttons.
 */
export function bindTabs() {
	const tabs = all('[data-profile-tab]');
	for (const button of tabs) {
		button.addEventListener('click', () => activateTab(button));
		button.addEventListener('keydown', event => {
			if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
			event.preventDefault();
			const next = nextTabIndex(event.key, tabs.indexOf(button), tabs.length);
			if (next < 0) return;
			tabs[next].focus();
			activateTab(tabs[next]);
		});
	}
	return tabs;
}
