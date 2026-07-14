// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module SearchRouteSafety
 * @description
 * Route failures become one public error vessel without leaking stacks or paths.
 */

const { er } = require('../../general.js');

async function safe(task) {
	try {
		return await task();
	} catch (error) {
		return er({
			code: error.code || 'SEARCH_ERROR',
			message: error.message,
			details: error.readiness
		});
	}
}

module.exports = {
	safe
};
