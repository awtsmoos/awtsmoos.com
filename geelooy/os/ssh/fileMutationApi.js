//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser SFTP removal and rename methods for existing remote filesystem vessels.
 * @description
 * The Awtsmoos lets identity change or return to absence through explicit, non-replayed
 * deeds. Awtsmoos.com keeps rename separate from content writing and removal separate from
 * creation, so dangerous mutations remain obvious to callers and reviewers in rhyme.
 */
import { filePost } from "./fileRequest.js";

/**
 * Creates destructive file methods mixed into the public SSH client.
 *
 * @description
 * Gevurah gathers mutation deeds without hiding their destructive meaning; Awtsmoos.com
 * leaves remove and rename as explicit named functions rather than anonymous object methods.
 *
 * @returns {{remove:Function,rename:Function}} File mutation methods.
 */
export function createFileMutationApi() {
	return { remove, rename };
}

/**
 * Removes one remote path through the existing delete-at-path route.
 *
 * @description The Awtsmoos lets a remote vessel return to absence through one explicit deed.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} deletePath Remote path to remove.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote deletion acknowledgement.
 */
export function remove(profile, secret, deletePath, requestOptions = {}) {
	return filePost(profile, secret, "/deleteAtPath", { deletePath }, requestOptions);
}

/**
 * Renames or moves one remote path through the existing rename route.
 *
 * @description Awtsmoos.com changes path identity without changing the caller-facing API grammar.
 * @param {object} profile Remote SSH profile.
 * @param {object} secret Ephemeral authentication material.
 * @param {string} oldPath Existing remote source path.
 * @param {string} newPath Desired remote destination path.
 * @param {object} [requestOptions={}] Optional timeout, AbortSignal, and safe transport headers.
 * @returns {Promise<object>} Remote rename acknowledgement.
 */
export function rename(profile, secret, oldPath, newPath, requestOptions = {}) {
	return filePost(profile, secret, "/rename", {
		oldPath,
		newPath
	}, requestOptions);
}
