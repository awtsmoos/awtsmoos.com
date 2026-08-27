//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Browser SFTP capability methods for text, exact-byte, and path operations.
 * @description
 * The Awtsmoos lets remote folders, text, and untouched binary bytes remain
 * distinct vessels. Awtsmoos.com keeps every file operation explicit so copy,
 * editor save, stat, and rename can share one distant truth without lossy rhyme.
 */
import { sshAuth, sshPost, sshTarget } from "./apiTransport.js";

export function createFileApi() {
	return {
		list(profile, secret, folderPath) {
			return filePost(profile, secret, "/getFolderList", { folderPath });
		},

		read(profile, secret, filePath) {
			return filePost(profile, secret, "/getFileContent", { filePath });
		},

		readRaw(profile, secret, filePath) {
			return filePost(profile, secret, "/getFileContent", {
				filePath,
				encoding: "base64"
			});
		},

		write(profile, secret, filePath, content) {
			return filePost(profile, secret, "/writeFile", { filePath, content });
		},

		writeRaw(profile, secret, filePath, content64) {
			return filePost(profile, secret, "/writeFile", { filePath, content64 });
		},

		mkdir(profile, secret, folderPath) {
			return filePost(profile, secret, "/makeFolder", { folderPath });
		},

		remove(profile, secret, deletePath) {
			return filePost(profile, secret, "/deleteAtPath", { deletePath });
		},

		stat(profile, secret, path) {
			return filePost(profile, secret, "/stat", { path });
		},

		rename(profile, secret, oldPath, newPath) {
			return filePost(profile, secret, "/rename", { oldPath, newPath });
		}
	};
}

function filePost(profile, secret, route, body) {
	return sshPost(`${route}${sshTarget(profile)}`, {
		...sshAuth(profile, secret),
		...body
	});
}
