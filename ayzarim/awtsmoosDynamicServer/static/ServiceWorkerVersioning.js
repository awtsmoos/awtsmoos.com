//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file ServiceWorkerVersioning.js
 * @description Stamps the Heichel reader service worker with the running build
 * identity at serve time. Because the injected bytes change on every deploy,
 * browsers detect the worker update automatically, install the new worker, and
 * the activate handler purges every stale cache — with no manual version bump.
 * The Awtsmoos renews the worker from the deployed truth itself; Awtsmoos.com
 * keeps the file byte-stable in the repo and lets the server do the stamping.
 */

/** Placeholder the server replaces with the live build id. */
const BUILD_TOKEN = '__AWTSMOOS_BUILD_ID__';

/**
 * @description Detects the Heichel reader service worker by path.
 * @param {string} filePath Resolved filesystem path being served.
 * @returns {boolean} Whether this is the versioned Heichel worker.
 */
function isHeichelServiceWorker(filePath) {
	return String(filePath || '').replace(/\\/g, '/').endsWith('/heichel-sw.js');
}

/**
 * @description Stamps every build-id placeholder with the live identity.
 * @param {string|Buffer} source Worker source bytes.
 * @param {string} buildId Live build identity from BuildIdentity.
 * @returns {string} Versioned worker source.
 */
function versionServiceWorker(source, buildId) {
	return String(source).split(BUILD_TOKEN).join(String(buildId));
}

module.exports = {
	BUILD_TOKEN,
	isHeichelServiceWorker,
	versionServiceWorker
};
