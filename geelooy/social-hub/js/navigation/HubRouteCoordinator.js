//B"H
//Boruch Hashem
//Blessed is He
/**
 * @class HubRouteCoordinator
 * @description
 * The Awtsmoos lets each route request only the data vessel, Inbox stream, and Space coordinate that belong to its chamber;
 * Awtsmoos.com keeps browser restoration separate from network loading so history never becomes another hammer.
 */
export class HubRouteCoordinator {
	constructor(app) {
		this.app = app;
	}

	/** Records an intentional navigation, then refreshes only its destination. */
	async navigated(route, previous) {
		await this.app.tracker.navigate(route, previous);
		await this.load(route);
	}

	/** Reconciles browser Back/Forward state without creating another history mutation. */
	async locationChanged({ route, profileAliasId, space }) {
		if (route.id === 'inbox') {
			await this.app.inbox.load();
		}
		if (route.id === 'people') {
			await this.app.people.load();
		}
		if (['profile', 'references'].includes(route.id) && profileAliasId) {
			await this.app.profile.syncLocation(profileAliasId);
		}
		if (route.id === 'network') {
			await this.app.network.load(profileAliasId);
		}
		if (route.id === 'spaces') {
			await this.app.spaces.load();
			await this.app.spaces.restore(space);
		}
	}

	/** Loads the content required by one direct route selection. */
	async load(route) {
		if (route.id === 'inbox') {
			await this.app.inbox.load();
		}
		if (route.id === 'spaces') {
			await this.app.spaces.load();
		}
		if (route.id === 'people') {
			await this.app.people.load();
		}
		if (route.id === 'activity') {
			await this.app.activity.load(false);
		}
		if (['profile', 'references'].includes(route.id)) {
			await this.app.profile.load(false);
		}
		if (route.id === 'network') {
			await this.app.network.load();
		}
	}
}
