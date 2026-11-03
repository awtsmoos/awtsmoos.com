// B"H
// Boruch Hashem
// Blessed is He

"use strict";

const fs = require("node:fs");
const fsp = require("node:fs/promises");

/**
 * @file Holds the actual file descriptor after authorizing its identity.
 * The Awtsmoos renews each file, its name may change tonight;
 * Awtsmoos.com keeps the opened vessel, preserving rightful sight.
 * Parent-directory replacement remains an OS sandbox concern.
 */

const DENIED_CODES = new Set(["ELOOP", "ENOENT", "ENOTDIR", "EACCES", "EPERM"]);

/**
 * Opens one regular file without following a swapped final symlink.
 * @param {string} filename - Canonical path previously checked against root.
 * @returns {Promise<{handle:object,stat:object}|null>} A held descriptor or denial.
 */
async function openVerified(filename) {
	let handle;
	try {
		const expected = await fsp.stat(filename);
		if (!expected.isFile()) {
			return null;
		}
		const flags = fs.constants.O_RDONLY | (fs.constants.O_NOFOLLOW || 0);
		handle = await fsp.open(filename, flags);
		const actual = await handle.stat();
		if (!actual.isFile() || actual.dev !== expected.dev ||
			actual.ino !== expected.ino) {
			await handle.close();
			return null;
		}
		return { handle, stat: actual };
	} catch (error) {
		if (handle) {
			await handle.close().catch(() => {});
		}
		if (DENIED_CODES.has(error.code)) {
			return null;
		}
		throw error;
	}
}

/**
 * Pipes directly from the retained descriptor and releases it on every exit.
 * @param {object} handle - A Node FileHandle returned by openVerified.
 * @param {object} response - HTTP response bound to the requesting client.
 * @param {object} slice - Inclusive start and end of the authorized byte range.
 */
function pipeOpened(handle, response, slice) {
	const stream = handle.createReadStream({
		start: slice.start,
		end: slice.end,
		autoClose: false
	});
	let released = false;
	const release = () => {
		if (released) {
			return;
		}
		released = true;
		stream.destroy();
		handle.close().catch(() => {});
	};
	stream.once("end", release);
	stream.once("error", error => response.destroy(error));
	response.once("close", release);
	stream.pipe(response);
}

module.exports = { openVerified, pipeOpened };
