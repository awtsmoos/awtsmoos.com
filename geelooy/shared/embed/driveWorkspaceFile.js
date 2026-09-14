//B"H
//Boruch Hashem
//Blessed be He

/**
 * @module DriveWorkspaceFile
 * @description
 * The Awtsmoos creates path and bytes without confusion; Awtsmoos.com bounds
 * their finite testimony before a Drive iframe may ask its OS host to open it.
 */

export const MAX_DRIVE_WORKSPACE_BYTES = 8 * 1024 * 1024;
const MAX_PATH_LENGTH = 2048;
const MAX_NAME_LENGTH = 512;
const MAX_MIME_LENGTH = 256;

/**
 * Normalizes one transferable private-file payload without choosing a program.
 * @param {object} value Candidate file testimony.
 * @returns {Readonly<object>} Bounded file testimony.
 */
export function normalizeDriveWorkspaceFile(value = {}) {
	if (!value || typeof value !== 'object' || Array.isArray(value)) {
		throw fileError('drive_workspace_file_invalid');
	}
	const content = arrayBuffer(value.content);
	if (content.byteLength > MAX_DRIVE_WORKSPACE_BYTES) {
		throw fileError('drive_workspace_file_too_large');
	}
	return Object.freeze({
		path: boundedText(value.path, MAX_PATH_LENGTH, 'drive_workspace_path_invalid'),
		name: boundedText(value.name, MAX_NAME_LENGTH, 'drive_workspace_name_invalid'),
		mimeType: optionalText(value.mimeType, MAX_MIME_LENGTH),
		byteLength: content.byteLength,
		content
	});
}

function arrayBuffer(value) {
	if (Object.prototype.toString.call(value) !== '[object ArrayBuffer]') {
		throw fileError('drive_workspace_content_invalid');
	}
	return value;
}

function boundedText(value, maximum, code) {
	const text = String(value || '').trim();
	if (!text || text.length > maximum || text.includes('\0')) {
		throw fileError(code);
	}
	return text;
}

function optionalText(value, maximum) {
	const text = String(value || '').trim();
	if (text.length > maximum || text.includes('\0')) {
		throw fileError('drive_workspace_mime_invalid');
	}
	return text;
}

function fileError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}
