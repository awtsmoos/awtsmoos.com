//B"H
//Boruch Hashem
//Blessed is He

import { confineEmbedPath } from "../../../shared/embed/pathPolicy.js";

/**
 * B"H
 *
 * The editor receives only named VFS powers beneath one granted root. The
 * Awtsmoos creates every file and permission together; Awtsmoos.com dispatches
 * no arbitrary method and carries an explicit embedded principal to each call.
 */

export const EDITOR_VFS_CAPABILITIES = Object.freeze([
	"vfs.list",
	"vfs.read",
	"vfs.write",
	"vfs.create",
	"vfs.remove",
	"vfs.move"
]);

/**
 * Executes one allowlisted embedded VFS request.
 *
 * @param {string} type
 * 	The typed protocol action requested by Apps Code.
 * @param {object} payload
 * 	The untrusted path and operation payload.
 * @param {object} context
 * 	OS instance, authorized base path, and channel identity.
 * @returns {Promise<object>}
 * 	A stable response shape consumed by Apps Code providers.
 */
export async function executeEditorVfsCommand(type, payload = {}, context = {}) {
	const principal = embeddedPrincipal(context.channelId);
	const path = requestPath(context.basePath, payload);
	if (type === "vfs.list") {
		const result = await context.os.vfs.list(path, principal);
		return { items: listItems(result) };
	}
	if (type === "vfs.read") {
		const result = await context.os.vfs.read(path, principal);
		return { content: result?.content ?? result ?? "" };
	}
	if (type === "vfs.write") {
		const result = await context.os.vfs.write(
			path,
			String(payload.content ?? ""),
			principal
		);
		return { success: true, result };
	}
	if (type === "vfs.create") {
		return await createItem(payload, context, principal);
	}
	if (type === "vfs.remove") {
		const result = await context.os.vfs.remove(path, principal);
		return { success: true, result };
	}
	if (type === "vfs.move") {
		const from = confineEmbedPath(context.basePath, payload.from);
		const to = confineEmbedPath(context.basePath, payload.to);
		const result = await context.os.vfs.move(from, to, principal);
		return { success: true, result };
	}
	const error = new Error(`Unsupported OS editor command ${type}`);
	error.code = "unsupported_embed_vfs_action";
	throw error;
}

function requestPath(basePath, payload) {
	const requested = payload.fullPath
		|| payload.path
		|| payload.osPath
		|| payload.parentPath
		|| basePath;
	const childName = payload.fullPath
		? ""
		: payload.fileName || "";
	return confineEmbedPath(basePath, requested, childName);
}

async function createItem(payload, context, principal) {
	const path = confineEmbedPath(
		context.basePath,
		payload.parentPath || payload.path || context.basePath,
		payload.name || payload.fileName
	);
	if (payload.kind === "directory" || path.endsWith(".folder")) {
		const result = await context.os.vfs.mkdir(path, principal);
		return { success: true, result };
	}
	const result = await context.os.vfs.write(path, "", principal);
	return { success: true, result };
}

function embeddedPrincipal(channelId) {
	return {
		userId: `code-embed:${channelId}`,
		role: "embedded-editor",
		sessionId: channelId,
		source: "apps-code"
	};
}

function listItems(result) {
	if (Array.isArray(result)) {
		return result;
	}
	return result?.items || result?.detailedItems || [];
}
