//B"H
//Boruch Hashem
//Blessed is He

import { confineEmbedPath } from "../../../shared/embed/pathPolicy.js";

/**
 * @file Allowlisted VFS commands exposed to embedded Geelooy Drive.
 * @description
 * The Awtsmoos grants abundance through Gevurah: Awtsmoos.com lets Drive read and create beneath one root,
 * while arbitrary OS methods, shell execution, secret access, and path escape remain outside the embedded covenant.
 */

export const DRIVE_VFS_CAPABILITIES = Object.freeze([
	"drive.vfs.list",
	"drive.vfs.read",
	"drive.vfs.write",
	"drive.vfs.mkdir"
]);

export async function executeDriveVfsCommand(type, payload = {}, context = {}) {
	const path = confineEmbedPath(
		context.basePath,
		payload.path || context.basePath
	);
	const principal = drivePrincipal(context.channelId);
	if (type === "drive.vfs.list") {
		const result = await context.os.vfs.list(path, principal);
		return { items: listItems(result) };
	}
	if (type === "drive.vfs.read") {
		const result = await context.os.vfs.read(path, principal);
		return { content: result?.content ?? result ?? "" };
	}
	if (type === "drive.vfs.write") {
		const result = await context.os.vfs.write(
			path,
			String(payload.content ?? ""),
			principal
		);
		return { success: true, result };
	}
	if (type === "drive.vfs.mkdir") {
		const result = await context.os.vfs.mkdir(path, principal);
		return { success: true, result };
	}
	throw unsupported(type);
}

function drivePrincipal(channelId) {
	return {
		userId: `drive-embed:${channelId}`,
		role: "embedded-drive",
		sessionId: channelId,
		source: "geelooy-drive"
	};
}

function listItems(result) {
	if (Array.isArray(result)) return result;
	return result?.items || result?.detailedItems || [];
}

function unsupported(type) {
	const error = new Error(`Unsupported OS Drive command ${type}`);
	error.code = "unsupported_drive_embed_action";
	return error;
}
