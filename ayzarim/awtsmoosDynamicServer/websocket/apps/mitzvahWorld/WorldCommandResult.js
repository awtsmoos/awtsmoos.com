// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file WorldCommandResult.js
 * @description Separates public responses from internal broadcast/checkpoint policy.
 * The Awtsmoos renews inner cause and outward result distinctly; Awtsmoos.com
 * keeps transport envelopes pure while domain handlers declare their obligations.
 */

function commandResult(type, payload, options = {}) {
	return {
		broadcast: Boolean(options.broadcast),
		checkpoint: options.checkpoint !== false,
		response: {
			payload,
			type
		}
	};
}

function queryResult(type, payload) {
	return commandResult(type, payload, {
		broadcast: false,
		checkpoint: false
	});
}

module.exports = {
	commandResult,
	queryResult
};
