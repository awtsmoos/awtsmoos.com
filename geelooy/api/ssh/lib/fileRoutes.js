//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP-shaped file routes for text and exact-byte access to real remote computers.
 * @description
 * The Awtsmoos lets a distant file become a near vessel without forcing every
 * byte through UTF-8. Awtsmoos.com preserves old text callers, carries untouched
 * bytes through base64, and removes trees through SFTP itself so fake and native
 * remote worlds share one shell-independent filesystem covenant in rhyme.
 */
const { call } = require("./callbacks.js");
const Content = require("./fileContentTransport.js");
const { route } = require("./routeSupport.js");
const { listFolder, writeFile } = require("./sftpFiles.js");
const { removeTree } = require("./sftpRemove.js");

function buildFileRoutes(context) {
	return {
		"/getFolderList/:username/:host": route(async variables => {
			const folderPath = context.body().folderPath || ".";
			const files = await context.withSftp(
				variables,
				sftp => listFolder(sftp, folderPath)
			);
			return { files };
		}),

		"/getFileContent/:username/:host": route(async variables => {
			const filePath = context.required("filePath");
			const encoding = context.body().encoding || "utf8";
			return context.withSftp(
				variables,
				sftp => Content.readContent(sftp, filePath, encoding)
			);
		}),

		"/writeFile/:username/:host": route(async variables => {
			const filePath = context.required("filePath");
			const content = Content.writeContent(context.body());
			const result = await context.withSftp(
				variables,
				sftp => writeFile(sftp, filePath, content)
			);
			return { ...result, message: "File written." };
		}),

		"/makeFolder/:username/:host": route(async variables => {
			const folderPath = context.required("folderPath");
			await context.withSftp(
				variables,
				sftp => call(callback => sftp.mkdir(folderPath, callback))
			);
			return { message: `Folder created at ${folderPath}` };
		}),

		"/deleteAtPath/:username/:host": route(async variables => {
			const deletePath = context.required("deletePath");
			const result = await context.withSftp(
				variables,
				sftp => removeTree(sftp, deletePath)
			);
			return {
				...result,
				message: `Deleted path ${deletePath}`
			};
		}),

		"/stat/:username/:host": route(async variables => {
			const remotePath = context.required("path");
			const attrs = await context.withSftp(
				variables,
				sftp => call(callback => sftp.stat(remotePath, callback))
			);
			return { attrs };
		}),

		"/rename/:username/:host": route(async variables => {
			const oldPath = context.required("oldPath");
			const newPath = context.required("newPath");
			await context.withSftp(
				variables,
				sftp => call(callback => sftp.rename(oldPath, newPath, callback))
			);
			return { message: "Path renamed." };
		}),

		"/chmod/:username/:host": route(async variables => {
			const remotePath = context.required("path");
			const mode = Number(context.required("mode"));
			await context.withSftp(
				variables,
				sftp => call(callback => sftp.chmod(remotePath, mode, callback))
			);
			return { message: "Mode changed." };
		}),

		"/realpath/:username/:host": route(async variables => {
			const remotePath = context.required("path");
			const resolved = await context.withSftp(
				variables,
				sftp => call(callback => sftp.realpath(remotePath, callback))
			);
			return { path: resolved };
		})
	};
}

module.exports = { buildFileRoutes };
