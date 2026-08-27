//B"H
// Boruch Hashem
// Blessed is He

const { recordDriveEvent } = require('./auditEvents.js');
const { normalizeProjectConfig, normalizeProjectId } = require('./projectConfigPolicy.js');
const { mutateDriveState, readDriveState } = require('./stateRepository.js');

/**
 * @module DriveProjectRegistryService
 * @description
 * The Awtsmoos lets any Drive folder become a durable named project while provider secrets remain elsewhere;
 * Awtsmoos.com records project intent atomically beside files, sites, domains, quotas, and audit testimony.
 */

async function listProjects(aliasId, $i = {}) {
	const state = await readDriveState(aliasId, $i);
	return Object.values(state.projects || {}).sort((a, b) => a.name.localeCompare(b.name));
}

async function getProject(aliasId, projectId, $i = {}) {
	const state = await readDriveState(aliasId, $i);
	return state.projects?.[normalizeProjectId(projectId)] || null;
}

async function findProjectByRoot(aliasId, rootPath, $i = {}) {
	const projects = await listProjects(aliasId, $i);
	return projects.find(project => project.rootPath === String(rootPath || '').replace(/^\/+|\/+$/g, '')) || null;
}

async function saveProject(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const id = normalizeProjectId(options.projectId);
		const existing = state.projects?.[id] || null;
		const project = normalizeProjectConfig(id, options.input, existing);
		state.projects ||= {};
		state.projects[id] = project;
		const event = recordDriveEvent(state, {
			type: existing ? 'project.update' : 'project.create',
			actorUserId: options.actorUserId,
			credentialId: options.credentialId,
			path: project.rootPath,
			requestId: options.requestId
		});
		return { project, event };
	});
}

async function deleteProject(options) {
	return mutateDriveState(options.aliasId, options.$i, state => {
		const id = normalizeProjectId(options.projectId);
		const project = state.projects?.[id];
		if (!project) throw projectError('PROJECT_NOT_FOUND', 404);
		delete state.projects[id];
		const event = recordDriveEvent(state, {
			type: 'project.delete',
			actorUserId: options.actorUserId,
			credentialId: options.credentialId,
			path: project.rootPath,
			requestId: options.requestId
		});
		return { project, event };
	});
}

function projectError(code, statusCode) {
	const error = new Error(code);
	error.code = code;
	error.statusCode = statusCode;
	return error;
}

module.exports = { deleteProject, findProjectByRoot, getProject, listProjects, saveProject };
