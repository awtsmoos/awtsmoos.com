//B"H
//Boruch Hashem
//Blessed is He

import { State } from "../state.js";
import { requestOsVfs } from "../embed/osChannel.js";
import { PostMessageOsFsAdapter } from "../../../../shared/virtual-os/fs/adapters/PostMessageOsFsAdapter.js";

/**
 * B"H
 * An OS-folder workspace is a mounted vessel, not a wildcard browser promise.
 * The Awtsmoos creates editor and filesystem together; Awtsmoos.com carries
 * every adapter request through the exact secure OS channel that can answer it.
 */
export const OSFolderProvider = {
	/** Sends one legacy adapter action through the versioned secure endpoint. */
	_requestFromOS(type, payload) {
		return requestOsVfs(type, payload);
	},
	/** Creates the existing shared adapter around the secure request boundary. */
	_adapter() {
		return new PostMessageOsFsAdapter({
			request: (type, payload) => this._requestFromOS(type, payload)
		});
	},
	/** Resolves an editor-relative item beneath its declared OS workspace root. */
	_getOSPath(workspacePath, itemPath) {
		let path = itemPath === "/" ? "" : String(itemPath || "");
		if (path && !path.startsWith("/")) {
			path = `/${path}`;
		}
		if (path.startsWith(workspacePath)) {
			return path.replace(/^\/+/, "");
		}
		return `${workspacePath}${path}`
			.replace(/\/+/g, "/")
			.replace(/^\/+/, "");
	},
	/** Returns the selected OS-folder workspace or rejects stale item identity. */
	_workspace(item) {
		const workspace = State.workspaces.find(
			candidate => candidate.id === item.workspaceId
		);
		if (!workspace || workspace.type !== "osfolder") {
			throw new Error("Could not find OS folder workspace.");
		}
		return workspace;
	},
	_path(item) {
		const workspace = this._workspace(item);
		return this._getOSPath(workspace.path, item.path);
	},
	async list(item) {
		const response = await this._adapter().run({
			action: "list",
			path: this._path(item)
		});
		assertResponse(response);
		return response.detailedItems.map(entry => ({
			name: entry.name,
			kind: entry.kind === "directory" ? "directory" : "file",
			path: `${item.path === "/" ? "" : item.path}/${entry.name}`,
			size: entry.size || 0,
			lastModified: entry.lastModified || 0
		}));
	},
	async read(item) {
		const response = await this._adapter().run({
			action: "read",
			path: this._path(item)
		});
		assertResponse(response);
		if (response.content === undefined || response.content === null) {
			throw new Error(`The physical vessel ${item.name} returned no content.`);
		}
		return response.content;
	},
	async write(item, content) {
		assertResponse(await this._adapter().run({
			action: "write",
			path: this._path(item),
			content
		}));
	},
	async create(parentDirectory, name, kind) {
		const workspace = this._workspace(parentDirectory);
		const parentPath = this._getOSPath(
			workspace.path,
			parentDirectory.path
		);
		const finalName = kind === "directory" && !name.endsWith(".folder")
			? `${name}.folder`
			: name;
		const path = `${parentPath === "." ? "" : `${parentPath}/`}${finalName}`;
		assertResponse(await this._adapter().run({
			action: kind === "directory" ? "makeFolder" : "write",
			path,
			content: ""
		}));
	},
	async delete(item) {
		assertResponse(await this._adapter().run({
			action: "delete",
			path: this._path(item),
			kind: item.kind
		}));
	}
};

function assertResponse(response) {
	if (!response?.ok) {
		throw new Error(response?.error || "Embedded OS filesystem action failed");
	}
	return response;
}
