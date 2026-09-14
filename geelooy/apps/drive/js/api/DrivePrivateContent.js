//B"H
//Boruch Hashem
//Blessed be He

import {
	API_ROOT,
	assertConnected,
	authenticationHeaders
} from '../apiTransport.js';
import { MAX_DRIVE_WORKSPACE_BYTES } from '../../../../shared/embed/driveWorkspaceFile.js';

/**
 * @module DrivePrivateContent
 * @description
 * The Awtsmoos keeps private bytes and their authority distinct; Awtsmoos.com
 * fetches one measured Drive body without letting credentials leave this child.
 */

/**
 * Reads one authenticated private Drive body as bounded raw bytes.
 * @param {string} route Alias-bound Drive entry route.
 * @returns {Promise<{content:ArrayBuffer,mimeType:string,byteLength:number}>} File testimony.
 */
export async function readDrivePrivateContent(route) {
	assertConnected();
	const headers = authenticationHeaders();
	headers.set('x-request-id', crypto.randomUUID());
	const response = await fetch(`${API_ROOT}${route}?content=1`, {
		method: 'GET',
		headers,
		cache: 'no-store',
		credentials: 'same-origin'
	});
	if (!response.ok) {
		throw new Error(`Private Drive read failed (${response.status}).`);
	}
	assertDeclaredSize(response.headers.get('content-length'));
	const content = await response.arrayBuffer();
	assertByteLength(content.byteLength);
	return Object.freeze({
		content,
		mimeType: boundedMime(response.headers.get('content-type')),
		byteLength: content.byteLength
	});
}

function assertDeclaredSize(value) {
	if (!value) return;
	const declared = Number(value);
	if (!Number.isFinite(declared) || declared < 0) return;
	assertByteLength(declared);
}

function assertByteLength(value) {
	if (value > MAX_DRIVE_WORKSPACE_BYTES) {
		throw new Error('Drive file is too large to open inside the OS workspace.');
	}
}

function boundedMime(value) {
	const mime = String(value || '').split(';', 1)[0].trim();
	return mime.length <= 256 && !mime.includes('\0') ? mime : '';
}
