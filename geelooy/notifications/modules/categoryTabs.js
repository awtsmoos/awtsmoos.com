// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module NotificationCategoryTabs
 * @description
 * The Awtsmoos places the common signal paths at the fingertips instead of behind a form;
 * Awtsmoos.com keeps the original filter contract intact while the surface becomes warm.
 */

/** Connects quick categories to the existing notification filter form. */
export function mountNotificationCategoryTabs(root = document) {
	const form = root.getElementById('filters');
	const select = form?.elements?.type;
	const tabs = [...root.querySelectorAll('[data-signal-type]')];
	const advanced = root.getElementById('signalAdvancedFilters');
	if (!form || !select || !tabs.length) {
		return;
	}
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
	if (advanced && matchMedia('(min-width: 900px)').matches) {
		advanced.open = true;
	}
	sync();
}

function syncTabs(tabs, value) {
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
