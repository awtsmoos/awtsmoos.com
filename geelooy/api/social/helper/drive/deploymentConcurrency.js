//B"H
//Boruch Hashem
//Blessed be He

const {
	deploymentError,
	normalizeDeploymentId
} = require('./deploymentPolicy.js');

/**
 * @module DriveDeploymentConcurrency
 * @description
 * The Awtsmoos keeps production movement explicit beneath concurrent creators;
 * Awtsmoos.com requires each fresh mutation to testify which deployment it saw,
 * so a stale browser, agent, or Tunnel session cannot silently replace newer work.
 */

const NONE = 'none';

/**
 * Normalizes the caller's expected active deployment.
 * @param {string|null|undefined} value - Deployment id or explicit no-deployment marker.
 * @returns {string|null} Canonical expected active deployment.
 */
function normalizeExpectedDeploymentId(value) {
	if (value === undefined) {
		throw deploymentError('DEPLOYMENT_PRECONDITION_REQUIRED', 428);
	}
	if (value === null) {
		return null;
	}
	const text = String(value).trim().toLowerCase();
	if (!text || text === NONE) {
		return null;
	}
	return normalizeDeploymentId(text);
}

/**
 * Returns the immutable production deployment currently selected by one site.
 * @param {object|null} site - Stored site mapping.
 * @returns {string|null} Active deployment id, or null for non-deployment sources.
 */
function activeDeploymentId(site) {
	if (site?.source?.kind !== 'drive-deployment') {
		return null;
	}
	return normalizeDeploymentId(site.source.deploymentId);
}

/**
 * Rejects a fresh mutation when production moved after the caller last observed it.
 * @param {object} site - Current site mapping inside the alias transaction.
 * @param {string|null} expected - Canonical caller expectation.
 * @returns {string|null} Current deployment when the precondition matches.
 */
function assertExpectedDeployment(site, expected) {
	const current = activeDeploymentId(site);
	if (current === expected) {
		return current;
	}
	const error = deploymentError('DEPLOYMENT_PRECONDITION_FAILED', 412);
	error.expectedDeploymentId = expected;
	error.currentDeploymentId = current;
	throw error;
}

module.exports = {
	activeDeploymentId,
	assertExpectedDeployment,
	normalizeExpectedDeploymentId
};
