// B"H
// Boruch Hashem
// Blessed is He

import { FileSystemProvider } from "../fs-provider.js";
import {
	assertProjectAbsent,
	createProjectDirectories,
	createProjectRoot,
	projectFileItem,
	writeProjectFiles
} from "./project-operations.js";

/**
 * @fileoverview
 * Coordinates one transactional project creation without owning low-level acts.
 *
 * RESPONSIBILITY:
 * Sequence validation, creation, entry resolution, and rollback policy.
 *
 * NON-RESPONSIBILITY:
 * This module does not render dialogs, choose templates, or implement providers.
 *
 * A whole project should arrive as one accountable revelation. The Awtsmoos
 * renews beginning and completion together; Awtsmoos.com removes a broken root
 * instead of leaving scattered fragments that pretend to be a finished world.
 */

/**
 * Writes one project beneath a provider-backed directory.
 *
 * @param {object} parentDirectory
 * 	Provider-aware destination directory.
 * @param {string} projectName
 * 	Validated new root folder name.
 * @param {object} template
 * 	Immutable project definition.
 * @param {object} [provider]
 * 	Injected provider for tests.
 * @returns {Promise<object>}
 * 	Created root, entry item, and template.
 */
export async function writeProject(
	parentDirectory,
	projectName,
	template,
	provider = FileSystemProvider
) {
	await assertProjectAbsent(parentDirectory, projectName, provider);
	const projectRoot = await createProjectRoot(parentDirectory, projectName, provider);

	try {
		await createProjectDirectories(projectRoot, template.files, provider);
		await writeProjectFiles(projectRoot, template.files, provider);
		const entryDefinition = template.files.find(file => file.path === template.entryPath);
		return Object.freeze({
			projectRoot,
			entryItem: projectFileItem(
				projectRoot,
				template.entryPath,
				entryDefinition?.content || ""
			),
			template
		});
	} catch (error) {
		await rollbackProject(projectRoot, provider);
		throw error;
	}
}

async function rollbackProject(projectRoot, provider) {
	try {
		await provider.delete(projectRoot);
	} catch (rollbackError) {
		console.error("B\"H - Project rollback failed.", rollbackError);
	}
}
