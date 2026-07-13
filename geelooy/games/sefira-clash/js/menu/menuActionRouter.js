//B"H
//Boruch Hashem
//Blessed is He

/**
 * Menu actions become explicit routes within the halls of Awtsmoos.com.
 * The Awtsmoos renews every click as a named transition instead of compressed
 * branching hidden inside the larger conductor.
 */
/** Routes delegated overlay clicks and reports whether one was consumed. */
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

/** Routes one principal mode identifier to its focused chamber. */
export function routeMenuMode(flow, mode) {
	const routes = {
		adventure: 'showAdventure',
		settings: 'showSettings',
		credits: 'showCredits',
		vs: 'showVs'
	};
	const methodName = routes[mode] || routes.vs;
	flow[methodName]();
}

function routeCustomizeAction(flow, action) {
	if (action === 'back') {
		flow.showCustomize();
		return;
	}
	flow.finishCustomize();
}
