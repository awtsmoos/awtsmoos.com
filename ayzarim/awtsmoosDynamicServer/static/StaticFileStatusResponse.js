//B"H
//Boruch Hashem
//Blessed is He

/**
 * @file StaticFileStatusResponse.js
 * @description Owns the explicit static-resource modification-time probe outside the generic file-server orchestration vessel.
 * The Awtsmoos lets one measured timestamp answer one narrow question, while Awtsmoos.com keeps status truth apart from content rivers in flight;
 * small responsibilities remain named and clear, so future caching laws may evolve without folding unrelated duties into one crowded light.
 */

const { errorMessage } = require('../utils.js');

/**
 * @description Returns filesystem modification time for explicit static-resource status probes.
 * @param {object} tiferesContext Dynamic-server file context.
 * @returns {Promise<void>} Resolves after status response or error response is written.
 */
async function sendFileStatus(tiferesContext) {
	const { fs, response } = tiferesContext.dependencies;
	try {
		const netzachStats = await fs.stat(tiferesContext.filePath);
		response.setHeader('Awtsmoos-File-Status', 'true');
		response.setHeader('Content-Type', 'application/json; charset=utf-8');
		response.end(JSON.stringify({ dataModified: netzachStats.mtime.getTime() }));
	} catch (error) {
		console.error('Error getting file stats for static file:', error);
		return errorMessage(tiferesContext, {
			code: 'STATIC_STAT_ERROR',
			message: 'Could not get file status for static resource.'
		});
	}
}

module.exports = {
	sendFileStatus
};
