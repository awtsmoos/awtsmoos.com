// B"H

/**
 * @file api/vector/status.js
 * @chapter Every Index Claim Is Reduced To Public Evidence
 * @description Normalizes graph status, rebuild acceptance, and strict errors.
 */

function usableReport(report) {
	return report.indexed > 0
		&& report.registryCount >= report.indexed
		&& report.entryNodeID >= 0;
}

function publicStatus(status) {
	return {
		path: status.path,
		configured: status.configured,
		registryCount: status.registryCount,
		entryNodeID: status.entryNodeID,
		maxLevel: status.maxLevel,
		usable: status.usable
	};
}

function vectorError(message, details) {
	const error = new Error(`B"H vector index error: ${message}`);
	error.code = 'AWTSMOOS_DB_VECTOR_INDEX_INVALID';
	error.details = details;
	return error;
}

module.exports = {
	publicStatus,
	usableReport,
	vectorError
};
