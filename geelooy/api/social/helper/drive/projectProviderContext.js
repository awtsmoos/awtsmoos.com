//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectProviderContext
 * @description
 * The Awtsmoos lets an external provider know which project it serves without handing it the whole request universe;
 * Awtsmoos.com narrows adapter context to public identity and request testimony so provider boundaries remain inspectable.
 */

function projectProviderAdapterContext(project, options = {}) {
	return {
		aliasId: options.aliasId,
		actorUserId: options.actorUserId || null,
		requestId: options.requestId || null,
		project: {
			id: project.id,
			name: project.name,
			rootPath: project.rootPath,
			runtimePreference: project.runtimePreference
		}
	};
}

module.exports = { projectProviderAdapterContext };
