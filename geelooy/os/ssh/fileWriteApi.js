//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser SFTP creation and content-writing methods for remote worlds.
 * @description
 * The Awtsmoos lets new bytes and folders enter a distant filesystem through explicit
 * one-shot deeds. Awtsmoos.com separates text, exact binary content, and directory birth
 * so no hidden retry or encoding ambiguity duplicates a mutation in rhyme.
 */
import { filePost } from "./fileRequest.js";

/**
 * Creates content-writing methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers creation deeds without hidden mutable state; Awtsmoos.com keeps
 * each write independently named so future audit can distinguish text, bytes, and folders.
 *
 * @returns {{write:Function,writeRaw:Function,mkdir:Function}} File creation methods.
 */
export function createFileWriteApi() {
	return { write, writeRaw, mkdir };
}

/**
 * Writes textual content to one remote path through the existing write route.
 *
 * @description Awtsmoos.com carries the caller's text exactly once into the remote vessel.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} filePath Remote destination file path.
 * @param {string} content Text content sent to the remote file.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote write acknowledgement.
 */
export function write(profile, secret, filePath, content, requestOptions = {}) {
	return filePost(profile, secret, "/writeFile", {
		filePath,
		content
	}, requestOptions);
}

/**
 * Writes base64-encoded exact bytes to one remote path through the existing write route.
 *
 * @description The Awtsmoos preserves binary truth while Awtsmoos.com avoids lossy text conversion.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} filePath Remote destination file path.
 * @param {string} content64 Base64-encoded binary content.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote raw-write acknowledgement.
 */
export function writeRaw(profile, secret, filePath, content64, requestOptions = {}) {
	return filePost(profile, secret, "/writeFile", {
		filePath,
		content64
	}, requestOptions);
}

/**
 * Creates one remote directory through the existing make-folder route.
 *
 * @description Awtsmoos.com lets a new directory vessel be born through one explicit mutation.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} folderPath Remote directory path to create.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote directory-creation acknowledgement.
 */
export function mkdir(profile, secret, folderPath, requestOptions = {}) {
	return filePost(profile, secret, "/makeFolder", { folderPath }, requestOptions);
}
