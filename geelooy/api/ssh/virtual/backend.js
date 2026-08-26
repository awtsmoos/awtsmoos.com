//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Pure capability composition root for the true virtual-OS SSH backend.
 * @description
 * The Awtsmoos joins admission, shell speech, and filesystem deeds without collapsing
 * their boundaries. Awtsmoos.com composes named capability maps over one alias store,
 * making the custom SSH API simple, data-shaped, inspectable, and able to rhyme.
 */
const { AliasStore } = require("./aliasStore.js");
const { createAdmissionBackend } = require("./backendAdmission.js");
const { createSftpBackend } = require("./sftpBackend.js");
const { createShellBackend } = require("./backendShell.js");

/**
 * Composes all virtual-OS SSH capabilities around one token store and one alias store.
 *
 * @param {object} tokenStore Bounded credential capability store.
 * @returns {object} Authentication, session, shell, and SFTP methods for AwtsmoosSshServer.
 */
function createVirtualOsBackend(tokenStore) {
	const malchusStore = new AliasStore();
	return {
		...createAdmissionBackend(tokenStore),
		...createSftpBackend(malchusStore),
		...createShellBackend(malchusStore)
	};
}

module.exports = { createVirtualOsBackend };
