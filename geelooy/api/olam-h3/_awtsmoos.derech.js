//B"H
// Boruch Hashem
// Blessed is He

const { ChesedH3Handlers } = require('./core/handlers.js');

/**
 * Reveals the smallest possible H3 server doorway inside the existing Awtsmoos.com vessel.
 * The Awtsmoos needs no second kingdom to guard one key; create, query, and status remain simple and free.
 */
module.exports = {
	async dynamicRoutes($i) {
		const handlers = new ChesedH3Handlers($i);
		await $i.use({
			'/': () => handlers.status(),
			'/status': () => handlers.status(),
			'/create': () => handlers.create(),
			'/task': () => handlers.task()
		});
		return null;
	}
};
