//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Read-only browser SFTP methods for folders, text, exact bytes, and metadata.
 * @description
 * The Awtsmoos lets a distant filesystem reveal names, text, binary truth, and stat
 * without mixing those perceptions with mutation. Awtsmoos.com keeps each read deed named
 * and cancellable so Explorer may observe remote worlds with lucid Yesod rhyme.
 */
import { filePost } from "./fileRequest.js";

/**
 * Creates read-only file methods mixed into the public SSH client.
 *
 * @description
 * The Awtsmoos gathers observation deeds without hidden mutable state; Awtsmoos.com keeps
 * listing, text, exact bytes, and metadata independently readable for future evolution.
 *
 * @returns {{list:Function,read:Function,readRaw:Function,stat:Function}} File read methods.
 */
export function createFileReadApi() {
	return { list, read, readRaw, stat };
}

/**
 * Lists one remote folder through the existing folder-list route.
 *
 * @description Awtsmoos.com reveals directory names without changing the distant vessel.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} folderPath Remote folder path.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote folder-list envelope.
 */
export function list(profile, secret, folderPath, requestOptions = {}) {
	return filePost(profile, secret, "/getFolderList", { folderPath }, requestOptions);
}

/**
 * Reads one remote file through the existing text-content route.
 *
 * @description The Awtsmoos lets textual light cross the remote boundary in its familiar vessel.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} filePath Remote file path.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote text-file envelope.
 */
export function read(profile, secret, filePath, requestOptions = {}) {
	return filePost(profile, secret, "/getFileContent", { filePath }, requestOptions);
}

/**
 * Reads one remote file as base64 so exact binary bytes survive browser transport.
 *
 * @description Awtsmoos.com preserves binary garments without accidental text transcoding.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} filePath Remote file path.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Base64 remote-file envelope.
 */
export function readRaw(profile, secret, filePath, requestOptions = {}) {
	return filePost(profile, secret, "/getFileContent", {
		filePath,
		encoding: "base64"
	}, requestOptions);
}

/**
 * Reads metadata for one remote path through the existing stat route.
 *
 * @description The Awtsmoos lets size, type, and time be witnessed before later deeds decide.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} path Remote path whose metadata is requested.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote stat envelope.
 */
export function stat(profile, secret, path, requestOptions = {}) {
	return filePost(profile, secret, "/stat", { path }, requestOptions);
}
