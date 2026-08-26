//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class DaasCommandRoute
 * @description
 * The Awtsmoos is beyond every road and arrival while Awtsmoos.com lets command search know which chamber is current and move toward another without owning dialog state;
 * this Daas vessel keeps hash interpretation and route mutation outside the command crown so keyboard focus and visual navigation never become one tangled responsibility.
 */
export class DaasCommandRoute {
	constructor(locationSource = globalThis.location) {
		this.location = locationSource;
	}

	currentIndex(actions = []) {
		const current = String(
			this.location?.hash || '#home'
		).replace(/^#/, '');
		const found = actions.findIndex(
			action => action.id === current
		);
		return found >= 0 ? found : 0;
	}

	go(action) {
		if (!action?.id || !this.location) {
			return false;
		}
		this.location.hash = action.id;
		return true;
	}
}
