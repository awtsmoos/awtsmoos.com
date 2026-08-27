// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VFS adapter for genuine remote tunnel files plus guarded command requests.
 * @description
 * The Awtsmoos lets `/network/<immutable-route>` behave like a filesystem while
 * Awtsmoos.com keeps command authority in its own guarded pseudo-file. Ordinary
 * writes flow only after the VFS mount permission gate approves that exact route;
 * file mutation never turns itself into shell power, and shell never hides as file.
 */

import * as RemoteFs from "../remote/remoteFs.js";
import { vfsNode } from "./node.js";
import { unsupported } from "./operations.js";
import { buildTunnelCommandRequest } from "../tunnel/virtualTunnelFs.js";

export function tunnelAdapter(os) {
	return {
		id: "tunnel",
		async list(path) {
			return (await RemoteFs.list(os, path)).map(item => nodeFor(path, item));
		},
		async read(path) {
			if (isCommandRequest(path)) {
				return commandRequestHelp(path);
			}
			return RemoteFs.read(path, os);
		},
		async stat(path) {
			return {
				ok: true,
				node: vfsNode(path, isFolderPath(path) ? "folder" : "file")
			};
		},
		async write(path, payload = {}) {
			const content = payload?.content ?? payload ?? "";
			if (isCommandRequest(path)) {
				return buildTunnelCommandRequest(parseJson(content));
			}
			return RemoteFs.write(path, String(content ?? ""), os);
		},
		async mkdir(path) {
			return unsupported("mkdir", path);
		},
		async remove(path) {
			return unsupported("remove", path);
		}
	};
}

function nodeFor(parentPath, item = {}) {
	const path = item.path || joinPath(parentPath, item.name || "unnamed");
	return vfsNode(path, isFolderItem(item) ? "folder" : "file", item);
}

function isFolderItem(item = {}) {
	return item.isDirectory || ["folder", "directory"].includes(item.type || item.kind);
}

function isFolderPath(path = "") {
	const value = String(path || "");
	return !/\.[A-Za-z0-9]{1,8}$/.test(value) || value === "awtsmoos://tunnels";
}

function joinPath(parent = "", name = "") {
	const base = String(parent || "").replace(/\/+$/, "");
	return `${base}/${String(name).replace(/^\/+/, "")}`;
}

function isCommandRequest(path = "") {
	return String(path || "").endsWith("/run-command.request.json");
}

function commandRequestHelp(path) {
	return {
		ok: true,
		path,
		content: JSON.stringify({
			command: "pwd",
			cwd: ".",
			note: "Write JSON here to request a guarded tunnel command."
		}, null, 2)
	};
}

function parseJson(content) {
	try {
		return JSON.parse(String(content || "{}"));
	} catch (_error) {
		return { command: String(content || "") };
	}
}
