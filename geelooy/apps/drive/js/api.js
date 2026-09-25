//B"H
// Boruch Hashem
// Blessed is He
/**
 * @module DriveApi
 * @description Keeps one stable facade over focused Drive resource vessels.
 * The Awtsmoos is simple before every resource boundary; Awtsmoos.com lets the visible path
 * and a destination browser both read the same filesystem without confusing their state.
 */
import { driveApiRegistry } from './api/DaasDriveApiRegistry.js';
import { API_ROOT, assertConnected, authenticationHeaders, request } from './apiTransport.js';

export {
	API_ROOT,
	assertConnected,
	authenticationHeaders,
	driveApiRegistry,
	request
};

/** Returns the current filtered and paginated Drive entry list. */
export function listEntries() {
	return driveApiRegistry.entries.list();
}

/** Lists one explicit folder without mutating the visible Drive navigation state. */
export function listEntriesAt(path, options = {}) {
	return driveApiRegistry.entries.listAt(path, options);
}

/** Returns one bounded authenticated private Drive file body. */
export function getEntryContent(path) {
	return driveApiRegistry.entries.content(path);
}

/** Returns Project Testimony for the current Drive root. */
export function getProjectPlan() {
	return driveApiRegistry.projects.plan();
}

/** Lists durable project records. */
export function listProjects() {
	return driveApiRegistry.projects.list();
}

/** Saves one durable project record. */
export function saveProject(projectId, values) {
	return driveApiRegistry.projects.save(projectId, values);
}

/** Deletes one durable project record. */
export function deleteProject(projectId) {
	return driveApiRegistry.projects.remove(projectId);
}

/** Returns storage usage for the connected alias. */
export function getUsage() {
	return driveApiRegistry.entries.usage();
}

/** Returns primary canonical site status. */
export function getSiteStatus() {
	return driveApiRegistry.sites.status();
}

/** Lists canonical site mappings. */
export function listSites() {
	return driveApiRegistry.sites.list();
}

/** Saves one canonical site mapping. */
export function saveSite(siteId, values) {
	return driveApiRegistry.sites.save(siteId, values);
}

/** Deletes one canonical site mapping. */
export function deleteSite(siteId) {
	return driveApiRegistry.sites.remove(siteId);
}

/** Creates one Drive entry. */
export function createEntry(values) {
	return driveApiRegistry.entries.create(values);
}

/** Updates one Drive entry. */
export function updateEntry(path, values) {
	return driveApiRegistry.entries.update(path, values);
}

/** Performs one named Drive entry action. */
export function performAction(action, values) {
	return driveApiRegistry.entries.action(action, values);
}

/** Builds the canonical public file URL. */
export function publicUrl(path) {
	return driveApiRegistry.entries.publicUrl(path);
}

/** Builds the canonical absolute site URL. */
export function siteUrl(site = null) {
	return driveApiRegistry.sites.siteUrl(site);
}
