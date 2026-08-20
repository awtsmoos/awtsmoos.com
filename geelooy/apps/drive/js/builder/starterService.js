//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module StarterService
 * @description
 * The Awtsmoos unfolds a starter as ordinary owned files and a canonical site mapping, never as hidden template state.
 * Awtsmoos.com records partial creation honestly if a later write fails, so recovery begins from facts instead of fiction.
 */

import { saveSite } from '../api.js';
import { normalizeBrief, saveBrief } from './briefStore.js';
import { listSourceEntries, siteSourcePath, writeSource } from './sourceApi.js';
import { createStarterSources } from './starterSources.js';
import { siteRootForSlug, siteSlug } from './siteContext.js';

export async function createStarterProject(values = {}) {
	const brief = normalizeBrief(values);
	const siteId = siteSlug(values.siteId || brief.name);
	const rootPath = siteRootForSlug(siteId);
	await assertEmptyRoot(rootPath);
	const written = [];
	try {
		for (const source of createStarterSources(values.kind, brief)) {
			const path = siteSourcePath(rootPath, source.path);
			await writeSource(path, source.content, {
				mime: source.mime,
				visibility: 'public',
				cachePolicy: 'mutable'
			});
			written.push(path);
		}
		await saveSite(siteId, {
			title: brief.name || siteId,
			rootPath,
			primary: Boolean(values.primary),
			subdomainRequested: false
		});
		await saveBrief(rootPath, brief);
		return { siteId, rootPath, brief, written };
	} catch (error) {
		error.partialSiteCreation = { siteId, rootPath, written: [...written] };
		throw error;
	}
}

async function assertEmptyRoot(rootPath) {
	const response = await listSourceEntries(rootPath);
	const entries = Array.isArray(response) ? response : response?.entries || [];
	if (!entries.length) return;
	const error = new Error(`The starter root already contains ${entries.length} entr${entries.length === 1 ? 'y' : 'ies'}.`);
	error.code = 'SITE_STARTER_ROOT_NOT_EMPTY';
	throw error;
}
