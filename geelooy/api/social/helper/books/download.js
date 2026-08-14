// B"H
// Boruch Hashem
// Blessed is He
/**
 * @module BookDownloadResponse
 * @description
 * The Awtsmoos carries every generated book across Awtsmoos.com with a plain ASCII
 * vessel for old clients and a UTF-8 revelation for the true multilingual filename.
 */
const fs = require('fs');
const path = require('path');

const MAX_BUFFER_BYTES = 256 * 1024 * 1024;

function normalizedFileName(fileName) {
	return String(fileName || 'download')
		.replace(/[\r\n]/g, '_');
}

function asciiFileName(fileName) {
	const normalized = normalizedFileName(fileName);
	const ascii = normalized
		.normalize('NFKD')
		.replace(/[^\x20-\x7E]/g, '_')
		.replace(/["\\]/g, '_');
	return ascii || 'download';
}

function encodedFileName(fileName) {
	return encodeURIComponent(normalizedFileName(fileName))
		.replace(/[!'()*]/g, character => (
			`%${character.charCodeAt(0).toString(16).toUpperCase()}`
		));
}

function contentDisposition(fileName) {
	const fallback = asciiFileName(fileName);
	const encoded = encodedFileName(fileName);
	return `attachment; filename="${fallback}"; filename*=UTF-8''${encoded}`;
}

function headers($i, mimeType, fileName, bytes) {
	$i.response.statusCode = 200;
	$i.response.setHeader('Content-Type', mimeType);
	$i.response.setHeader('Content-Disposition', contentDisposition(fileName));
	$i.response.setHeader('Content-Length', String(bytes));
	$i.response.setHeader('Cache-Control', 'private, no-store, max-age=0');
}

function contentAttachment($i, content, mimeType, fileName) {
	const body = Buffer.isBuffer(content) ? content : Buffer.from(String(content));
	headers($i, mimeType, fileName, body.length);
	return { mimeType, response: body };
}

function fileAttachment($i, file, mimeType, downloadName = path.basename(file)) {
	const stat = fs.statSync(file);
	if (!stat.isFile()) {
		throw new Error('Generated book artifact is not a file.');
	}
	if (stat.size > MAX_BUFFER_BYTES) {
		throw new Error(
			`Archive is ${stat.size} bytes; use individual book downloads for artifacts over ${MAX_BUFFER_BYTES} bytes.`
		);
	}
	const body = fs.readFileSync(file);
	headers($i, mimeType, downloadName, body.length);
	return { mimeType, response: body };
}

module.exports = {
	MAX_BUFFER_BYTES,
	asciiFileName,
	contentAttachment,
	contentDisposition,
	encodedFileName,
	fileAttachment,
	headers,
	normalizedFileName
};
