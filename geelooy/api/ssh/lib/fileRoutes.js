// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file SFTP-shaped file routes for real remote computers.
 * @description The Awtsmoos lets a distant file become a near vessel; Awtsmoos.com names each guarded motion so browse and save may rhyme.
 */
const { call } = require("./callbacks.js");
const { removePath } = require("./commands.js");
const { route } = require("./routeSupport.js");
const { listFolder, readFile, writeFile } = require("./sftpFiles.js");

/**
 * Builds the remote-file route family consumed by the Geelooy SSH drive.
 * @param {object} context Request-scoped SSH helpers.
 * @returns {object} Dynamic route map.
 */
function buildFileRoutes(context) {
	return {
		"/getFolderList/:username/:host": route(async vars => {
			const folderPath = context.body().folderPath || ".";
			const files = await context.withSftp(vars, sftp => listFolder(sftp, folderPath));
			return { files };
		}),
		"/getFileContent/:username/:host": route(async vars => {
			const filePath = context.required("filePath");
			const content = await context.withSftp(vars, sftp => readFile(sftp, filePath));
			return { content };
		}),
		"/writeFile/:username/:host": route(async vars => {
			const filePath = context.required("filePath");
			const content = context.body().content || "";
			const result = await context.withSftp(vars, sftp => writeFile(sftp, filePath, content));
			return { ...result, message: "File written." };
		}),
		"/makeFolder/:username/:host": route(async vars => {
			const folderPath = context.required("folderPath");
			await context.withSftp(vars, sftp => call(callback => sftp.mkdir(folderPath, callback)));
			return { message: `Folder created at ${folderPath}` };
		}),
		"/deleteAtPath/:username/:host": route(async vars => {
			const deletePath = context.required("deletePath");
			await context.withClient(vars, client => removePath(client, deletePath));
			return { message: `Deleted path ${deletePath}` };
		}),
		"/stat/:username/:host": route(async vars => {
			const path = context.required("path");
			const attrs = await context.withSftp(vars, sftp => call(callback => sftp.stat(path, callback)));
			return { attrs };
		}),
		"/rename/:username/:host": route(async vars => {
			const oldPath = context.required("oldPath");
			const newPath = context.required("newPath");
			await context.withSftp(vars, sftp => call(callback => sftp.rename(oldPath, newPath, callback)));
			return { message: "Path renamed." };
		}),
		"/chmod/:username/:host": route(async vars => {
			const path = context.required("path");
			const mode = Number(context.required("mode"));
			await context.withSftp(vars, sftp => call(callback => sftp.chmod(path, mode, callback)));
			return { message: "Mode changed." };
		}),
		"/realpath/:username/:host": route(async vars => {
			const path = context.required("path");
			const resolved = await context.withSftp(vars, sftp => call(callback => sftp.realpath(path, callback)));
			return { path: resolved };
		})
	};
}

module.exports = { buildFileRoutes };
