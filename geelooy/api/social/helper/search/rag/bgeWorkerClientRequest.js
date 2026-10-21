//B"H
//Blessed is He
//Boruch Hashem


/**
 * @module bgeWorkerClientRequest
 * @description
 * BGE worker readiness waiting and vector requests.
 */

const {
	QUERY_TIMEOUT_MS,
	READY_TIMEOUT_MS,
	codedError,
	waitForWorker
} = require('./multilingualWorkerDeadline.js');

const { startWorker: _startWorker, pending, getChild } = require('./bgeWorkerClientCore.js');
let child = null;
let sequence = 0;
const startWorker = (...args) => { const result = _startWorker(...args); child = getChild(); return result; };

async function waitForReady(timeoutMs = READY_TIMEOUT_MS) {
	return waitForWorker(startWorker, timeoutMs);
}

async function requestVector(query, timeoutMs = QUERY_TIMEOUT_MS) {
	await waitForReady();
	const id = String(++sequence);
	return new Promise((resolve, reject) => {
		const timer = setTimeout(() => {
			pending.delete(id);
			reject(codedError('BGE_QUERY_TIMEOUT', 'BGE query embedding timed out.'));
		}, timeoutMs);
		pending.set(id, { resolve, reject, timer });
		child.stdin.write(`${JSON.stringify({ id, query })}\n`);
	});
}

const warmBgeWorker = startWorker;
process.once('exit', () => child?.kill());

module.exports = {
	waitForReady,
	requestVector,
	warmBgeWorker
};
