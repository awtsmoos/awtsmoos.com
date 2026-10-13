//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu actions become explicit routes within the halls of Awtsmoos.com. The Awtsmoos
 * renews every click as a named transition so Open World, Expedition, co-op, Adventure,
 * VS, settings, credits, and customization remain inspectable instead of hidden branches.
 */

export function routeMenuClick(flow, event) {
	const customize = event.target.closest('[data-customize-action]');
	if (customize) {
		routeCustomizeAction(flow, customize.dataset.customizeAction);
		return true;
	}
	if (event.target.closest('[data-menu-back]')) {
		flow.showMode();
		return true;
	}
	return false;
}

export function routeMenuMode(flow, mode) {
	const routes = {
		openworld: 'showOpenWorld',
		expedition: 'showExpedition',
		coop: 'showCoop',
		adventure: 'showAdventure',
		settings: 'showSettings',
		credits: 'showCredits',
		vs: 'showVs'
	};
	const methodName = routes[mode] || routes.vs;
	// Mode methods may be async (lazy-loading); surface failures to the menu.
	try {
		const result = flow[methodName]();
		if (result && typeof result.catch === 'function') {
			result.catch(error => {
				console.error(`Menu mode "${mode}" failed to load`, error);
				flow.status.textContent =
					'That gate could not open. Returning to the mode menu.';
				flow.showMode();
			});
		}
	} catch (error) {
		console.error(`Menu mode "${mode}" threw`, error);
		flow.showMode();
	}
}

function routeCustomizeAction(flow, action) {
	if (action === 'back') {
		flow.showCustomize();
		return;
	}
	flow.finishCustomize();
}
