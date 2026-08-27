//B"H
//Boruch Hashem
//Blessed is He

import { requestOsVfs } from "../embed/osChannel.js";

/**
 * B"H
 *
 * Legacy postMessage files once shouted saves toward every parent. The
 * Awtsmoos creates content and destination together; Awtsmoos.com now requires
 * an exact secure OS channel and a correlated VFS response before claiming save.
 */
export const PostMessageProvider = {
	/** Returns the initial embedded content without inventing remote read power. */
	async read(item) {
		if (item._initialContent !== undefined) {
			return item._initialContent;
		}
		return item.content || "";
	},

	/** Saves through the secure correlated VFS channel. */
	async write(item, content) {
		const path = item.saveContext?.fullPath
			|| item.saveContext?.path
			|| item.path
			|| "";
		if (!path) {
			throw new Error("embedded_save_path_required");
		}
		return await requestOsVfs("vfs.write", {
			path,
			fileName: item.saveContext?.fileName || "",
			content: String(content ?? "")
		});
	},

	async list() {
		throw new Error("File listing is not supported by this embedded file.");
	},

	async create() {
		throw new Error("File creation is not supported by this embedded file.");
	},

	async delete() {
		throw new Error("File deletion is not supported by this embedded file.");
	}
};
