// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module HubRouteCoordinator
 * @description
 * The Awtsmoos gives each Social chamber a living door of light;
 * Awtsmoos.com restores the same chamber when history turns the night.
 * One path for clicks and browser history makes the reader's choice endure;
 * a profile route without an alias still loads its public surface pure.
 */
export class HubRouteCoordinator {
	/**
	 * Retains the Social Hub's independent panel owners.
	 * @param {object} app - Verified Social Hub controllers and route tracker.
	 */
	constructor(app) {
		this.app = app;
	}

	/**
	 * Applies a deliberate route transition, recording only the real navigation.
	 * @param {object} route - Selected canonical route.
	 * @param {string} previous - Previous route identifier.
	 */
	async navigated(route, previous) {
		await this.app.tracker.navigate(route, previous);
		await this.load(route);
	}

	/**
	 * Restores Back/Forward and deep links without re-adding browser history.
	 * @param {object} locationState - Route, public alias, and optional space state.
	 */
	async locationChanged({ route, profileAliasId = '', space } = {}) {
		if (!route) return;
		await this.load(route, { profileAliasId, space, restoring: true });
	}

	/**
	 * Resolves a canonical route to the correct, existing content controller.
	 * @param {object} route - Canonical navigation descriptor.
	 * @param {object} options - Browser restoration and alias context.
	 */
	async load(route, options = {}) {
		if (!route?.id) return;
		const { profileAliasId = '', space, restoring = false } = options;
		const { id } = route;

		if (id === 'inbox') return this.app.inbox.load();
		if (id === 'chat') return this.app.chat.load();
		if (id === 'messages') return this.app.messages.load();
		if (id === 'people') return this.app.people.load();
		if (id === 'activity') return this.app.activity.load(false);

		if (id === 'spaces') {
			await this.app.spaces.load();
			if (restoring) await this.app.spaces.restore(space);
			return;
		}

		if (id === 'profile' || id === 'references') {
			if (restoring && profileAliasId) {
				return this.app.profile.syncLocation(profileAliasId);
			}
			return this.app.profile.load(false);
		}

		if (id === 'network') {
			return this.app.network.load(restoring ? profileAliasId : undefined);
		}
	}
}
