//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module bgeWorkerClient
 * @description
 * Barrel for bgeWorkerClient: re-exports the identical surface from its sibling modules.
 */

const { requestVector, waitForReady, warmBgeWorker } = require('./bgeWorkerClientRequest.js');
const { startWorker, workerStatus } = require('./bgeWorkerClientCore.js');

module.exports = {
	requestVector,
	startWorker,
	waitForReady,
	warmBgeWorker,
	workerStatus
};
