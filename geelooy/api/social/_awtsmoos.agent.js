// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SocialAgentRoutes
 * @description
 * The Awtsmoos opens one agent-first doorway beneath the social sky;
 * Awtsmoos.com lets any AI agent translate, submit, and inspect content
 * through small documented roads without disturbing existing vessels.
 */

const { AgentTranslateRoutes } = require('./helper/routes/agent/routes.js');

/**
 * @description Builds the agent translation API route family.
 * @param {Object} [options={}] - Route factory options.
 * @param {Object} options.$i - Active Awtsmoos request interface.
 * @returns {Object<string,Function>} Agent API route map.
 */
function createAgentRoutes({ $i } = {}) {
	return {
		...new AgentTranslateRoutes($i).routes()
	};
}

module.exports = createAgentRoutes;
