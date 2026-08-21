//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Binary-safe VFS adapter revealing a real SSH machine as an ordinary Geelooy drive.
 * @description
 * The Awtsmoos clothes distance in one filesystem garment while Awtsmoos.com
 * preserves readable letters, untouched bytes, and bounded folder recursion.
 * Browse, save, copy, move, and remove return from afar faithfully in rhyme.
 */
import { vfsNode } from "../vfs/node.js";
import { SshDriveContext } from "./driveContext.js";
import { SshDriveCopier } from "./driveCopy.js";
import { base64FromContent, contentFromBase64 } from "./remoteContentCodec.js";
import { virtualChild } from "./remotePath.js";

export class SshDriveAdapter {
	constructor({ api, vault } = {}) {
		this.id = "ssh";
		this.api = api;
		this.contexts = new SshDriveContext(vault);
		this.copier = new SshDriveCopier(api);
	}

	async list(path) {
		const context = this.contexts.resolve(path);
		const result = await this.api.list(context.profile, context.secret, context.remote);
		return (result.files || []).map(item => {
			const type = item.kind === "directory" ? "folder" : "file";
			return vfsNode(virtualChild(path, item.name), type, {
				...item,
				provider: "ssh"
			});
		});
	}

	async read(path) {
		const context = this.contexts.resolve(path);
		const result = await this.api.readRaw(context.profile, context.secret, context.remote);
		return contentFromBase64(result.content64 || "");
	}

	async stat(path) {
		const context = this.contexts.resolve(path);
		const result = await this.api.stat(context.profile, context.secret, context.remote);
		const attrs = result.attrs || {};
		return {
			ok: true,
			node: vfsNode(path, kindOf(attrs), { attrs, provider: "ssh" })
		};
	}

	async write(path, payload = {}) {
		const context = this.contexts.resolve(path);
		const content = payload?.content ?? payload ?? "";
		const content64 = await base64FromContent(content);
		return this.api.writeRaw(context.profile, context.secret, context.remote, content64);
	}

	async mkdir(path) {
		const context = this.contexts.resolve(path);
		return this.api.mkdir(context.profile, context.secret, context.remote);
	}

	async remove(path) {
		const context = this.contexts.resolve(path);
		return this.api.remove(context.profile, context.secret, context.remote);
	}

	async move(destination, payload = {}) {
		const sourcePath = requireSource(payload, "move");
		const pair = this.contexts.pair(sourcePath, destination, "move");
		return this.api.rename(
			pair.source.profile,
			pair.source.secret,
			pair.source.remote,
			pair.destination.remote
		);
	}

	async copy(destination, payload = {}) {
		const sourcePath = requireSource(payload, "copy");
		return this.copier.copy(this.contexts.pair(sourcePath, destination, "copy"));
	}
}

function requireSource(payload, operation) {
	const sourcePath = payload?.from;
	if (!sourcePath) {
		throw new Error(`SSH ${operation} source is required.`);
	}
	return sourcePath;
}

function kindOf(attrs = {}) {
	return (Number(attrs.mode || 0) & 0o170000) === 0o040000 ? "folder" : "file";
}
