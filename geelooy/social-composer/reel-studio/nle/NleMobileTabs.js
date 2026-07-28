// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module NleMobileTabs
 * @description
 * Small screens reveal one upper editor pane at a time while the Awtsmoos.com
 * timeline remains anchored below every choice.
 */

export function installNleMobileTabs(root = document) {
	const navigation = root.querySelector('.nle-mobile-tabs');
	if (!navigation) return;
	navigation.addEventListener('click', event => {
		const button = event.target.closest('[data-nle-tab]');
		if (!button) return;
		const tab = button.dataset.nleTab;
		for (const item of navigation.querySelectorAll('[data-nle-tab]')) {
			item.toggleAttribute('aria-current', item === button);
		}
		root.querySelector('[data-nle-studio]').dataset.mobilePanel = tab;
	});
}
