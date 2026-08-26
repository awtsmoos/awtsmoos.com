//B"H
//Boruch Hashem
//Blessed is He

/**
 * @class NetzachCivilizationReadRoutes
 * @description
 * The Awtsmoos continuously creates what appears to endure, while Netzach gives that endurance an honest read-path;
 * Awtsmoos.com lets feed, entity state, and global state share one guarded GET covenant without merging their domain meanings, so persistence and clarity rhyme.
 *
 * RESPONSIBILITY:
 * Coordinate the three GET-only civilization read routes.
 *
 * NON-RESPONSIBILITY:
 * This class does not register paths, mutate civilization data, parse JSON, or own storage.
 */
class NetzachCivilizationReadRoutes {
	/**
	 * @param {Object} options
	 * 	Explicit collaborators for durable read routes.
	 * @param {Object} options.requestContext
	 * 	Current Awtsmoos API request context.
	 * @param {Object} options.civilization
	 * 	Civilization domain service.
	 * @param {Object} options.request
	 * 	Binah request adapter.
	 * @param {Object} options.methods
	 * 	Gevurah method policy.
	 */
	constructor({
		requestContext,
		civilization,
		request,
		methods
	}) {
		this.requestContext = requestContext;
		this.civilization = civilization;
		this.request = request;
		this.methods = methods;
	}

	/**
	 * @param {Object} variables
	 * 	Route variables containing `alias`.
	 * @returns {Promise<*>}
	 * 	The established alias feed result or BAD_METHOD envelope.
	 */
	async feed(variables) {
		const badMethod = this.requireGet();

		if (badMethod) {
			return badMethod;
		}

		return this.civilization.civilizationFeed({
			$i: this.requestContext,
			aliasId: variables.alias,
			limit: this.request.limit()
		});
	}

	/**
	 * @param {Object} variables
	 * 	Route variables containing entity `type` and `id`.
	 * @returns {Promise<*>}
	 * 	The established entity-state result or BAD_METHOD envelope.
	 */
	async entityState(variables) {
		const badMethod = this.requireGet();

		if (badMethod) {
			return badMethod;
		}

		return this.civilization.civilizationEntityState({
			$i: this.requestContext,
			type: variables.type,
			id: variables.id
		});
	}

	/**
	 * @returns {Promise<*>}
	 * 	The established global civilization state or BAD_METHOD envelope.
	 */
	async state() {
		const badMethod = this.requireGet();

		if (badMethod) {
			return badMethod;
		}

		return this.civilization.getCivilizationState({
			$i: this.requestContext
		});
	}

	/**
	 * @returns {Object|null}
	 * 	Null for GET or the established BAD_METHOD envelope.
	 */
	requireGet() {
		return this.methods.require(
			this.requestContext,
			'GET'
		);
	}
}

module.exports = {
	NetzachCivilizationReadRoutes
};
