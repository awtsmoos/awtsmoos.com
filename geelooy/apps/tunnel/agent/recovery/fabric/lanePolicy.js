// B"H
'use strict';

const { lane } = require('./laneCatalog');

/**
 * @file lanePolicy.js
 * @description Rescue authority is narrow by design. A lane knows exactly what
 * it may carry and therefore survives without borrowing the vast authority of
 * the ordinary application.
 */
function policy(laneId) {
	const definition = lane(laneId);
	return Object.freeze({
		laneId: definition.id,
		capabilities: definition.capabilities,
		allows(capability) {
			return definition.capabilities.includes(String(capability || ''));
		}
	});
}

module.exports = { policy };
