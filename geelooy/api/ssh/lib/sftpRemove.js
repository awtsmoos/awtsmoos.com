//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Bounded SFTP-native recursive removal for real and simulated SSH computers.
 * @description
 * The Awtsmoos reveals each remote child without borrowing a native shell;
 * Awtsmoos.com descends only through directories, never follows symbolic-link
 * shadows, refuses the filesystem root, and counts every vessel before removal
 * so destructive power remains measured by Gevurah and guarded in rhyme.
 */
const path = require("node:path");
const { call } = require("./callbacks.js");
const { listFolder } = require("./sftpFiles.js");

const MAX_DEPTH = 48;
const MAX_ENTRIES = 5000;

/**
 * Removes one remote file, symlink, or directory tree through SFTP-v3 verbs.
 *
 * @param {object} sftp
 * 	Ready SFTP client exposing lstat, readdir, unlink, and rmdir.
 * @param {string} remotePath
 * 	Remote path whose complete tree should be removed.
 * @returns {Promise<object>}
 * 	Removal summary containing the normalized target and visited entry count.
 */
async function removeTree(sftp, remotePath) {
	const target = normalizeTarget(remotePath);
	const state = { visited: 0 };
	await removeNode(sftp, target, state, 0);
	return {
		removed: target,
		entries: state.visited
	};
}

/**
 * Removes one node without following symbolic links into another tree.
 *
 * @param {object} sftp Ready SFTP client.
 * @param {string} target Normalized POSIX remote path.
 * @param {object} state Shared visit counter.
 * @param {number} depth Current directory depth.
 * @returns {Promise<void>}
 */
async function removeNode(sftp, target, state, depth) {
	assertBudget(state, depth);
	const attrs = await call(callback => sftp.lstat(target, callback));
	state.visited += 1;
	assertBudget(state, depth);
	if (!isDirectory(attrs) || isSymbolicLink(attrs)) {
		await call(callback => sftp.unlink(target, callback));
		return;
	}
	const entries = await listFolder(sftp, target);
	for (const entry of entries) {
		if (entry.name === "." || entry.name === "..") {
			continue;
		}
		await removeNode(
			sftp,
			path.posix.join(target, safeChild(entry.name)),
			state,
			depth + 1
		);
	}
	await call(callback => sftp.rmdir(target, callback));
}

function normalizeTarget(value) {
	const source = String(value || "").trim();
	if (!source) {
		throw new Error("SSH delete path is required.");
	}
	const normalized = path.posix.normalize(source);
	if (normalized === "/" || normalized === ".") {
		throw new Error("SSH recursive delete refuses the remote root.");
	}
	return normalized;
}

function safeChild(value) {
	const name = String(value || "");
	if (!name || name.includes("/") || name.includes("\0") || name === "." || name === "..") {
		throw new Error("SSH directory entry contains an unsafe child name.");
	}
	return name;
}

function assertBudget(state, depth) {
	if (depth > MAX_DEPTH) {
		throw new Error(`SSH delete exceeded maximum depth ${MAX_DEPTH}.`);
	}
	if (state.visited > MAX_ENTRIES) {
		throw new Error(`SSH delete exceeded ${MAX_ENTRIES} entries.`);
	}
}

function isDirectory(attrs = {}) {
	return attrs.isDirectory?.() || (Number(attrs.mode || 0) & 0o170000) === 0o040000;
}

function isSymbolicLink(attrs = {}) {
	return attrs.isSymbolicLink?.() || (Number(attrs.mode || 0) & 0o170000) === 0o120000;
}

module.exports = { removeTree };
