// B"H
// Boruch Hashem
// Blessed is He

/**
 * @module ExactHebrewIndex
 * @description
 * This public façade reveals worker-backed v3 exact search without exposing
 * lifecycle machinery to routes. Warm-up remains asynchronous and read-only.
 */

const {
	ROOTS,
	normalizeWord
} = require('./exactHebrewShape.js');
const workerClient = require('./exactHebrewWorkerClient.js');

function dbPath() {
	return workerClient.dbPath();
}

function exactHebrewStatus() {
	return workerClient.status();
}

function warmExactHebrewIndex() {
	return workerClient.start();
}

function searchExactHebrewWord(request) {
	return workerClient.search(request);
}

setImmediate(() => {
	warmExactHebrewIndex().catch(() => {});
});

module.exports = {
	ROOTS,
	dbPath,
	exactHebrewStatus,
	normalizeWord,
	searchExactHebrewWord,
	warmExactHebrewIndex
};
