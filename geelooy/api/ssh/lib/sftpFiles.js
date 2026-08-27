//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP file helpers with explicit subsystem ownership and bounded transfer.
 * @description
 * The Awtsmoos lets a request borrow one remote filesystem vessel and return it
 * cleanly when its work is complete. Awtsmoos.com closes the SFTP channel before
 * the surrounding SSH connection departs, so rapid HTTP requests do not leave
 * half-open kingdoms colliding at the transport shore in rhyme.
 */
const { call } = require("./callbacks.js");
const { openSftp } = require("./client.js");
const Transfer = require("./sftpTransfer.js");

async function withSftp(client, task) {
	const sftp = await openSftp(client);
	try {
		return await task(sftp);
	} finally {
		closeSftpSession(sftp);
	}
}

function closeSftpSession(sftp) {
	const channel = sftp?._channel;
	if (!channel || channel._state === "closed") {
		return;
	}
	channel.close();
}

async function listFolder(sftp, folderPath) {
	const entries = await call(callback => sftp.readdir(folderPath || ".", callback));
	return entries.map(entry => ({
		name: entry.filename,
		longname: entry.longname,
		kind: kindOf(entry.attrs),
		attrs: entry.attrs
	}));
}

async function readFileBuffer(sftp, filePath) {
	return Transfer.readBuffer(sftp, filePath);
}

async function readFile(sftp, filePath) {
	return (await readFileBuffer(sftp, filePath)).toString("utf8");
}

async function writeFile(sftp, filePath, content) {
	const data = Buffer.isBuffer(content)
		? content
		: Buffer.from(String(content || ""), "utf8");
	return Transfer.writeBuffer(sftp, filePath, data);
}

function kindOf(attrs = {}) {
	if (attrs.isDirectory?.()) {
		return "directory";
	}
	if (attrs.isFile?.()) {
		return "file";
	}
	if (attrs.isSymbolicLink?.()) {
		return "symlink";
	}
	const type = Number(attrs.mode || 0) & 0o170000;
	if (type === 0o040000) {
		return "directory";
	}
	if (type === 0o100000) {
		return "file";
	}
	if (type === 0o120000) {
		return "symlink";
	}
	return "unknown";
}

module.exports = {
	listFolder,
	readFile,
	readFileBuffer,
	withSftp,
	writeFile
};
