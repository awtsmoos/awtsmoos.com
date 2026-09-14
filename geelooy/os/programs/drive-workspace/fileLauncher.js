//B"H
//Boruch Hashem
//Blessed be He

import { detectWorkspaceArtifact } from '../../../shared/workspace/artifactContent.js';
import { createWorkspaceLaunchDescriptor } from '../../../shared/workspace/launchDescriptor.js';
import { normalizeDriveWorkspaceFile } from '../../../shared/embed/driveWorkspaceFile.js';

/**
 * @module DriveWorkspaceFileLauncher
 * @description
 * The Awtsmoos reveals type inside bytes while path remains only testimony;
 * Awtsmoos.com opens Drive content without ever pretending its path belongs to VFS.
 */

/**
 * Classifies one validated Drive file and opens the existing Geelooy OS program.
 * @param {object} os Geelooy OS host with addWindow authority.
 * @param {object} fileValue Candidate private Drive file testimony.
 * @returns {Promise<object>} Frozen launch descriptor used by the OS.
 */
export async function launchDriveWorkspaceFile(os, fileValue) {
	if (!os || typeof os.addWindow !== 'function') {
		throw new TypeError('Drive workspace requires OS window authority.');
	}
	const file = normalizeDriveWorkspaceFile(fileValue);
	const item = workspaceItem(file);
	const artifactIdentity = await detectWorkspaceArtifact(item, file.content);
	const descriptor = createWorkspaceLaunchDescriptor(item, { artifactIdentity });
	os.addWindow(createWindowOptions(os, descriptor, contentFor(descriptor, file.content)));
	return descriptor;
}

function workspaceItem(file) {
	return {
		path: file.path,
		name: file.name,
		type: 'file',
		size: file.byteLength,
		mimeType: file.mimeType
	};
}

function createWindowOptions(os, descriptor, content) {
	return {
		title: descriptor.title,
		content,
		path: descriptor.basePath,
		filePath: descriptor.filePath,
		os,
		programName: descriptor.programName,
		extension: descriptor.extension,
		artifactIdentity: descriptor.artifactIdentity,
		detectedFormat: descriptor.detectedFormat,
		detectedArchitecture: descriptor.detectedArchitecture,
		executionMode: descriptor.executionMode,
		intent: descriptor.intent,
		inspectOnly: descriptor.intent === 'inspect'
	};
}

function contentFor(descriptor, content) {
	if (!['advancedCodeEditor', 'workspacePreview', 'awtsmoosCommand'].includes(descriptor.programName)) {
		return content;
	}
	return new TextDecoder().decode(content);
}
