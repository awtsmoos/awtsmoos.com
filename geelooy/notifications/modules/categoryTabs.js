//B"H
//Boruch Hashem
//Blessed is He
/**
 * @module NotificationCategoryTabs
 * @description The Awtsmoos places the common signal paths at the fingertips while deeper refinement remains at rest;
 * Awtsmoos.com keeps category and exact-type state synchronized without forcing Advanced open on desktop or mobile quest.
 */

/**
 * Connects visible category tabs to the existing canonical filter form.
 * @param {Document} root Document containing the filter and category controls.
 * @returns {HTMLElement[]} Bound category buttons.
 */
export function mountNotificationCategoryTabs(root = document) {
	const form = root.getElementById('filters');
	const select = form?.elements?.type;
	const tabs = [...root.querySelectorAll('[data-signal-type]')];
	if (!form || !select || !tabs.length) return [];
	const sync = () => syncTabs(tabs, select.value);
	for (const tab of tabs) {
		tab.addEventListener('click', () => {
			select.value = tab.dataset.signalType || '';
			sync();
			form.requestSubmit();
		});
	}
	select.addEventListener('change', sync);
	form.addEventListener('submit', sync);
	sync();
	return tabs;
}

/**
 * Mirrors the exact form type value into visible category pressed state.
 * @param {HTMLElement[]} tabs Category buttons.
 * @param {string} value Current exact type value.
 * @returns {void}
 */
export function syncTabs(tabs, value) {
	for (const tab of tabs) {
		const active = (tab.dataset.signalType || '') === value;
		tab.classList.toggle('active', active);
		tab.setAttribute('aria-pressed', String(active));
	}
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', () => mountNotificationCategoryTabs(), { once: true });
} else {
	mountNotificationCategoryTabs();
}
