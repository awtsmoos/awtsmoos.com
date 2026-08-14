//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveApi
 * @description
 * The Awtsmoos lets files, sites, durable projects, and Project Testimony speak through small resource verbs;
 * Awtsmoos.com keeps transport authority in one vessel while this module names the creator's intentions.
 */

import { driveState, currentCursor } from './state.js';
import { encodeDrivePath } from './path.js';
import { API_ROOT, aliasSegment, assertConnected, authenticationHeaders, request } from './apiTransport.js';

export { API_ROOT, assertConnected, authenticationHeaders, request };

export function listEntries() {
	const query = new URLSearchParams({
		path: driveState.currentPath,
		search: driveState.filters.search,
		type: driveState.filters.type,
		visibility: driveState.filters.visibility,
		includeTrash: String(driveState.filters.includeTrash),
		sort: driveState.filters.sort,
		direction: driveState.filters.direction,
		limit: '50'
	});
	const cursor = currentCursor();
	if (cursor) query.set('cursor', cursor);
	return request(`/drive/${aliasSegment()}/entries?${query}`);
}

export function getProjectPlan() {
	const query = new URLSearchParams({ rootPath: driveState.currentPath });
	return request(`/drive/${aliasSegment()}/project?${query}`);
}

export function listProjects() {
	return request(`/drive/${aliasSegment()}/projects`);
}

export function saveProject(projectId, values) {
	return request(`/drive/${aliasSegment()}/projects/${encodeURIComponent(projectId)}`, { method: 'PUT', body: values });
}

export function deleteProject(projectId) {
	return request(`/drive/${aliasSegment()}/projects/${encodeURIComponent(projectId)}`, { method: 'DELETE' });
}

export function getUsage() {
	return request(`/drive/${aliasSegment()}/usage`);
}

export function getSiteStatus() {
	return request(`/drive/${aliasSegment()}/site`);
}

export function listSites() {
	return request(`/drive/${aliasSegment()}/sites`);
}

export function saveSite(siteId, values) {
	return request(`/drive/${aliasSegment()}/sites/${encodeURIComponent(siteId)}`, { method: 'PUT', body: values });
}

export function deleteSite(siteId) {
	return request(`/drive/${aliasSegment()}/sites/${encodeURIComponent(siteId)}`, { method: 'DELETE' });
}

export function createEntry(values) {
	return request(`/drive/${aliasSegment()}/entries`, { method: 'POST', body: values });
}

export function updateEntry(path, values) {
	return request(entryUrl(path), { method: 'PUT', body: values });
}

export function performAction(action, values) {
	return request(`/drive/${aliasSegment()}/actions/${action}`, { method: 'POST', body: values });
}

export function publicUrl(path) {
	return `${location.origin}${API_ROOT}/drive/public/${aliasSegment()}/${encodeDrivePath(path)}`;
}

export function siteUrl(site = null) {
	const route = site?.project?.publication?.route || site?.canonicalUrl || `/sites/${aliasSegment()}/`;
	return new URL(route, location.origin).href;
}

function entryUrl(path) {
	return `/drive/${aliasSegment()}/entry/${encodeDrivePath(path)}`;
}
