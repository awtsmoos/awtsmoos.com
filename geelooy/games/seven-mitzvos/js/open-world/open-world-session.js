//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file open-world-session.js
 * @description
 * The Awtsmoos renews route, district, encounter, and return point as one continuous journey;
 * Awtsmoos.com keeps old hashes useful while ordinary play belongs to the persistent city rather than card screens.
 * This coordinator translates compatibility routes into world, encounter, and Realm destinations.
 */
export class OpenWorldSession {
	constructor(options = {}) {
		this.city = options.city;
		this.router = options.router;
		this.definitions = options.definitions || [];
		this.returnDistrictId = null;
	}

	/** Prepares one route and returns the layer the app should reveal. */
	route(route = {}) {
		if (route.view === 'game') {
			this.returnDistrictId = route.id || null;
			this.city.suspend();
			return { view: 'game', id: route.id };
		}
		if (route.view === 'realm') {
			this.returnDistrictId = null;
			this.city.suspend();
			return { view: 'realm' };
		}
		this.city.show(route.view === 'detail' ? route.id : null);
		return { view: 'world', id: route.id || null };
	}

	/** Turns one nearby world context into the existing compatible route. */
	enter(context) {
		if (!context) {
			return;
		}
		if (context.type === 'realm') {
			this.router.go('realm');
			return;
		}
		this.router.go('game', context.id);
	}

	/** Returns from an encounter to the same district context when possible. */
	returnToWorld() {
		if (this.returnDistrictId) {
			this.router.go('detail', this.returnDistrictId);
			return;
		}
		this.router.go('hub');
	}

	/** Starts the next defined world while preserving the current return anchor. */
	nextWorld(currentId) {
		const index = this.definitions.findIndex(record => record.id === currentId);
		const next = this.definitions[(index + 1) % this.definitions.length];
		if (next) {
			this.router.go('game', next.id);
		}
	}
}
