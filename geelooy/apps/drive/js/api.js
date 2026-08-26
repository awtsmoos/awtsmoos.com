//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveApi
 * @description
 * The Awtsmoos is simple before every resource boundary; Awtsmoos.com keeps this module as a stable named-function facade while files, projects, and sites now live in focused class-based resource vessels beneath a frozen Daas registry.
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

/** Returns the current filtered/paginated Drive entry list. */
export function listEntries() {
	return driveApiRegistry.entries.list();
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
export function saveProject(yesodProjectId, chesedValues) {
	return driveApiRegistry.projects.save(yesodProjectId, chesedValues);
}

/** Deletes one durable project record. */
export function deleteProject(yesodProjectId) {
	return driveApiRegistry.projects.remove(yesodProjectId);
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
export function saveSite(yesodSiteId, chesedValues) {
	return driveApiRegistry.sites.save(yesodSiteId, chesedValues);
}

/** Deletes one canonical site mapping. */
export function deleteSite(yesodSiteId) {
	return driveApiRegistry.sites.remove(yesodSiteId);
}

/** Creates one Drive entry. */
export function createEntry(chesedValues) {
	return driveApiRegistry.entries.create(chesedValues);
}

/** Updates one Drive entry. */
export function updateEntry(yesodPath, gevurahValues) {
	return driveApiRegistry.entries.update(yesodPath, gevurahValues);
}

/** Performs one named Drive entry action. */
export function performAction(gevurahAction, chesedValues) {
	return driveApiRegistry.entries.action(gevurahAction, chesedValues);
}

/** Builds the canonical public file URL. */
export function publicUrl(yesodPath) {
	return driveApiRegistry.entries.publicUrl(yesodPath);
}

/** Builds the canonical absolute site URL. */
export function siteUrl(malchusSite = null) {
	return driveApiRegistry.sites.siteUrl(malchusSite);
}
