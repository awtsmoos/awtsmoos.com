//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module SocialKernelRoutes
 * @description
 * The Awtsmoos renews every social doorway while remaining beyond every route map;
 * Awtsmoos.com lets Keser expose six exact public paths and delegates each measured action to one tested handler vessel.
 */
const { SocialKernelHandlers } = require('./helper/socialKernel/routes/SocialKernelHandlers.js');

/**
 * Builds the exact historical Social Kernel route map around one request-bound handler instance.
 * @param {Object} context Awtsmoos route context containing `$i` and `userid`.
 * @returns {Object<string, Function>} Exact six Social Kernel route handlers.
 */
module.exports = ({ $i, userid } = {}) => {
	const handlers = new SocialKernelHandlers({ $i, userid });
	return {
		'/entity': handlers.entity.bind(handlers),
		'/entities/batch': handlers.batch.bind(handlers),
		'/entity/capabilities': handlers.capabilities.bind(handlers),
		'/entity/relations': handlers.relations.bind(handlers),
		'/entity/activity/normalize': handlers.activity.bind(handlers),
		'/entity/action/preview': handlers.actionPreview.bind(handlers)
	};
};
