//B"H
//Boruch Hashem
//Blessed be He

import { joinWorkspacePath } from "../core/path.js";
import {
	remixDirectories,
	remixFolderName,
	validateSegments
} from "./siteRemixImportPaths.js";

const PROVENANCE_FILE = ".awtsmoos-remix-origin.json";

/**
 * Imports a validated public remix into a new isolated folder through the same
 * workspace mutations humans use. Existing project files are never overwritten.
 */
export async function importSiteRemix({ workspace, state }, manifest) {
	const starting = state.snapshot();
	const parentPath = starting.currentPath || ".";
	const folderName = remixFolderName(manifest, starting.entries);
	if (!(await workspace.createFolder(folderName))) throw importError("REMIX_FOLDER_CREATE_FAILED");
	const rootPath = joinWorkspacePath(parentPath, folderName);
	if (!(await workspace.navigate(rootPath))) throw importError("REMIX_FOLDER_OPEN_FAILED");
	try {
		await createDirectories(workspace, rootPath, remixDirectories(manifest.files));
		for (const file of manifest.files) {
			await createRemixFile(workspace, rootPath, file);
		}
		await createProvenance(workspace, rootPath, manifest);
		await workspace.navigate(rootPath, { force: true });
		const index = state.snapshot().entries.find(entry => entry.name.toLowerCase() === "index.html");
		if (index) await workspace.openEntry(index);
		state.patch({ message: `Remixed ${manifest.title || manifest.siteId} into ${folderName}.` });
		return Object.freeze({ folderName, rootPath, created: manifest.files.length });
	} catch (error) {
		state.patch({
			error: `Remix stopped inside ${folderName}. Existing projects were not changed.`
		});
		throw error;
	}
}

async function createDirectories(workspace, rootPath, directories) {
	for (const directory of directories) {
		const segments = validateSegments(directory);
		const name = segments.at(-1);
		const parent = segments.slice(0, -1).join("/");
		if (!(await workspace.navigate(parent ? joinWorkspacePath(rootPath, parent) : rootPath))) {
			throw importError("REMIX_DIRECTORY_PARENT_FAILED");
		}
		if (!(await workspace.createFolder(name))) throw importError("REMIX_DIRECTORY_CREATE_FAILED");
	}
}

async function createRemixFile(workspace, rootPath, file) {
	const segments = validateSegments(file.path);
	const name = segments.at(-1);
	const parent = segments.slice(0, -1).join("/");
	const directory = parent ? joinWorkspacePath(rootPath, parent) : rootPath;
	if (!(await workspace.navigate(directory))) throw importError("REMIX_FILE_PARENT_FAILED");
	if (!(await workspace.createFile(name))) throw importError("REMIX_FILE_CREATE_FAILED");
	workspace.setDraft(file.content);
	if (!(await workspace.saveDocument())) throw importError("REMIX_FILE_SAVE_FAILED");
}

async function createProvenance(workspace, rootPath, manifest) {
	if (!(await workspace.navigate(rootPath))) return;
	const entries = workspace.state?.snapshot?.().entries || [];
	const provenanceName = availableProvenanceName(entries);
	if (!(await workspace.createFile(provenanceName))) return;
	workspace.setDraft(JSON.stringify({
		BH: 'B"H',
		kind: "awtsmoos-remix-origin",
		source: manifest.canonicalUrl,
		aliasId: manifest.aliasId,
		siteId: manifest.siteId,
		sourceKind: manifest.sourceKind,
		sourceRevision: manifest.sourceRevision || null,
		receipt: manifest.receipt || null,
		remixedAt: new Date().toISOString()
	}, null, "\t"));
	await workspace.saveDocument();
}

function availableProvenanceName(entries) {
	const taken = new Set(entries.map(entry => String(entry?.name || "").toLowerCase()));
	if (!taken.has(PROVENANCE_FILE)) return PROVENANCE_FILE;
	for (let number = 2; number <= 99; number += 1) {
		const name = `.awtsmoos-remix-origin-${number}.json`;
		if (!taken.has(name)) return name;
	}
	return `.awtsmoos-remix-origin-${Date.now()}.json`;
}

function importError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
