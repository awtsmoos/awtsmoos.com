//B"H
// Boruch Hashem
// Blessed is He

/**
 * @module DriveProjectLinks
 * @description
 * Links a durable project record to its library folder path, in both directions:
 *   project -> libraryPath   stored on the project record itself
 *                            (YetzirahProjectsResource.save accepts arbitrary
 *                            attributes, so { libraryPath } rides along with the
 *                            rest of the record — least invasive path)
 *   folder  -> projectId     stored on the folder via the entry-metadata
 *                            contract (js/entryMetadata.js, owned by the
 *                            metadata workstream; used defensively)
 *
 * All persistence is injected, so this module has no network and no DOM.
 */

/** Metadata key the metadata workstream owns for the folder->project link. */
export const PROJECT_ID_KEY = 'projectId';

/** WS-7 server limit for projectId values. */
export const MAX_PROJECT_ID_LENGTH = 128;

/**
 * Detects the metadata workstream's real contract (js/entryMetadata.js, WS-2):
 * getMetadata(entry)/updateMetadata(entry, patch) on ENTRY OBJECTS, marked by
 * the exported METADATA_FIELDS. Legacy/test seams use path-keyed
 * getMetadata(path)/updateMetadata(path, patch) and lack the marker.
 */
function isEntryObjectContract(metadata) {
	return Boolean(metadata) && Array.isArray(metadata.METADATA_FIELDS);
}

/**
 * Reads the project linked to a library folder.
 *
 * Resolution order (first truth wins):
 *   1. the entry record itself (options.entry) — the server returns projectId
 *      on the entry; this is the live truth once WS-2/WS-7 land.
 *   2. the real entry-metadata contract via the entry object
 *      (options.metadata with METADATA_FIELDS, or the dynamically loaded
 *      ./entryMetadata.js) — getMetadata(entry).projectId.
 *   3. legacy path-keyed metadata seams (unit tests, pre-contract hosts).
 *
 * @param {string} folderPath
 * @param {{metadata?:object, entry?:object}} [options]
 * @returns {Promise<{projectId:string|null}>}
 */
export async function getFolderProject(folderPath, options = {}) {
	const direct = options.entry && typeof options.entry === 'object'
		? String(options.entry[PROJECT_ID_KEY] || '')
		: '';
	if (direct) return { projectId: direct };
	const metadata = options.metadata || (await loadEntryMetadata());
	if (metadata && typeof metadata.getMetadata === 'function') {
		if (isEntryObjectContract(metadata)) {
			const meta = metadata.getMetadata(options.entry || { path: folderPath });
			const projectId = meta && typeof meta.projectId === 'string' ? meta.projectId : '';
			if (projectId) return { projectId };
			return { projectId: null };
		}
		const record = await metadata.getMetadata(folderPath);
		return { projectId: record?.[PROJECT_ID_KEY] ? String(record[PROJECT_ID_KEY]) : null };
	}
	return { projectId: null };
}

/**
 * Links a library folder to a project (folder -> project direction).
 * Always mirrors the value onto options.entry (local truth) so the host
 * renders the link immediately; the `via` field reports which persistence
 * actually accepted the write ('entryMetadata' only on real success).
 *
 * Clear semantics follow the WS-7 metadata contract: null or '' clears the
 * link (writes projectId null). Values are limited to 128 chars.
 *
 * @param {string} folderPath
 * @param {string|null} projectId
 * @param {{metadata?:object, entry?:object}} [options]
 */
export async function setFolderProject(folderPath, projectId, options = {}) {
	const linked = projectId === null || projectId === undefined || String(projectId).trim() === ''
		? null
		: String(projectId);
	if (linked && linked.length > MAX_PROJECT_ID_LENGTH) {
		throw new Error(`setFolderProject: projectId is too long (max ${MAX_PROJECT_ID_LENGTH})`);
	}
	if (options.entry && typeof options.entry === 'object') {
		options.entry[PROJECT_ID_KEY] = linked;
	}
	const metadata = options.metadata || (await loadEntryMetadata());
	if (metadata && typeof metadata.updateMetadata === 'function') {
		if (isEntryObjectContract(metadata)) {
			const result = await metadata.updateMetadata(
				{ path: folderPath, ...(options.entry || {}) },
				{ [PROJECT_ID_KEY]: linked }
			);
			return {
				folderPath, projectId: linked,
				via: result && result.ok ? 'entryMetadata' : 'entry'
			};
		}
		await metadata.updateMetadata(folderPath, { [PROJECT_ID_KEY]: linked });
		return { folderPath, projectId: linked, via: 'entryMetadata' };
	}
	return { folderPath, projectId: linked, via: options.entry ? 'entry' : 'none' };
}

/**
 * Loads the entry-metadata contract defensively (may not have landed yet).
 * @returns {Promise<{getMetadata:Function, updateMetadata:Function}|null>}
 */
export async function loadEntryMetadata() {
	try {
		const module = await import('./entryMetadata.js');
		if (module && (typeof module.getMetadata === 'function' || typeof module.updateMetadata === 'function')) {
			return module;
		}
		return null;
	} catch {
		return null;
	}
}

/**
 * Links a project record to its library folder (project -> library direction).
 * Reads the record through the projects resource, merges libraryPath, saves back.
 * @param {{list:Function, save:Function}} projects YetzirahProjectsResource-like
 * @param {string} projectId
 * @param {string} libraryPath
 */
export async function linkProjectLibrary(projects, projectId, libraryPath) {
	if (!projects || typeof projects.save !== 'function') {
		throw new Error('linkProjectLibrary needs a projects resource with save()');
	}
	if (!projectId) throw new Error('linkProjectLibrary needs a projectId');
	const record = await readProjectRecord(projects, projectId);
	await projects.save(projectId, { ...record, libraryPath: String(libraryPath || '') });
	return { projectId: String(projectId), libraryPath: String(libraryPath || '') };
}

/**
 * Reads the library folder linked to a project record.
 * @param {{list:Function}} projects YetzirahProjectsResource-like
 * @param {string} projectId
 * @returns {Promise<{projectId:string, libraryPath:string|null, project:object|null}>}
 */
export async function getProjectLibrary(projects, projectId) {
	const project = await readProjectRecord(projects, projectId);
	return {
		projectId: String(projectId),
		libraryPath: project?.libraryPath ? String(project.libraryPath) : null,
		project
	};
}

/**
 * Establishes the link in both directions at once.
 */
export async function linkProjectAndFolder({ projects, metadata, entry }, projectId, folderPath) {
	const projectLink = await linkProjectLibrary(projects, projectId, folderPath);
	const folderLink = await setFolderProject(folderPath, projectId, { metadata, entry });
	return { projectLink, folderLink };
}

async function readProjectRecord(projects, projectId) {
	if (typeof projects.list !== 'function') return null;
	const listing = await projects.list();
	const records = Array.isArray(listing) ? listing : listing?.projects || listing?.records || [];
	return records.find(record => String(record?.id || record?.projectId || '') === String(projectId)) || null;
}
