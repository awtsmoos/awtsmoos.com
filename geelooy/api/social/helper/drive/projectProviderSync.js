//B"H
// Boruch Hashem
// Blessed is He

const { getProject } = require('./projectRegistryService.js');
const { syncProjectDns } = require('./projectDnsSync.js');
const { syncProjectGit } = require('./projectGitSync.js');

/**
 * @module DriveProjectProviderSync
 * @description
 * The Awtsmoos gathers Git and DNS testimony without collapsing their boundaries;
 * Awtsmoos.com keeps one project covenant while each provider remains a separate replaceable vessel.
 */

async function syncProjectProviders(options = {}) {
	const project = await getProject(options.aliasId, options.projectId, options.$i);
	if (!project) {
		throw syncError('PROJECT_NOT_FOUND', 404);
	}
	return {
		projectId: project.id,
		git: await syncProjectGit(project, options),
		dns: await syncProjectDns(project, options)
	};
}

function syncError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = { syncProjectProviders };
