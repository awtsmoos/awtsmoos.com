// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file VFS adapter that reveals a real SSH machine as an ordinary Geelooy drive.
 * @description The Awtsmoos clothes distance in one filesystem garment; Awtsmoos.com lets list, read, write, copy, move, and remove return from afar in rhyme.
 */
import { vfsNode } from "../vfs/node.js";
import { remotePath, splitSshPath, virtualChild } from "./remotePath.js";

export class SshDriveAdapter {
	constructor({ api, vault } = {}) {
		this.id = "ssh";
		this.api = api;
		this.vault = vault;
	}

	async list(path) {
		const context = this.context(path);
		const result = await this.api.list(context.profile, context.secret, context.remote);
		return (result.files || []).map(item => {
			const type = item.kind === "directory" ? "folder" : "file";
			return vfsNode(virtualChild(path, item.name), type, { ...item, provider: "ssh" });
		});
	}

	async read(path) {
		const context = this.context(path);
		const result = await this.api.read(context.profile, context.secret, context.remote);
		return result.content ?? "";
	}

	async stat(path) {
		const context = this.context(path);
		const result = await this.api.stat(context.profile, context.secret, context.remote);
		const attrs = result.attrs || {};
		return {
			ok: true,
			node: vfsNode(path, kindOf(attrs), { attrs, provider: "ssh" })
		};
	}

	async write(path, payload = {}) {
		const context = this.context(path);
		const content = payload?.content ?? payload ?? "";
		return this.api.write(context.profile, context.secret, context.remote, content);
	}

	async mkdir(path) {
		const context = this.context(path);
		return this.api.mkdir(context.profile, context.secret, context.remote);
	}

	async remove(path) {
		const context = this.context(path);
		return this.api.remove(context.profile, context.secret, context.remote);
	}

	async move(destination, payload = {}) {
		const sourcePath = payload?.from;
		if (!sourcePath) {
			throw new Error("SSH move source is required.");
		}
		const source = this.context(sourcePath);
		const target = this.context(destination);
		assertSameProfile(source, target, "move");
		return this.api.rename(source.profile, source.secret, source.remote, target.remote);
	}

	async copy(destination, payload = {}) {
		const sourcePath = payload?.from;
		if (!sourcePath) {
			throw new Error("SSH copy source is required.");
		}
		const source = this.context(sourcePath);
		const target = this.context(destination);
		assertSameProfile(source, target, "copy");
		const result = await this.api.read(source.profile, source.secret, source.remote);
		return this.api.write(target.profile, target.secret, target.remote, result.content ?? "");
	}

	context(path) {
		const parsed = splitSshPath(path);
		const profile = this.vault.get(parsed.name);
		if (!profile) {
			throw new Error(`SSH profile not found: ${parsed.name}`);
		}
		const secret = this.vault.secret(profile.name);
		if (!secret?.password && !secret?.privateKey) {
			throw new Error(`SSH credentials are required for ${profile.name}. Reconnect or remount it.`);
		}
		return { profile, secret, remote: remotePath(profile, parsed.relative) };
	}
}

function assertSameProfile(source, target, operation) {
	if (source.profile.name !== target.profile.name) {
		throw new Error(`SSH ${operation} cannot cross remote profiles.`);
	}
}

function kindOf(attrs = {}) {
	return (Number(attrs.mode || 0) & 0o170000) === 0o040000 ? "folder" : "file";
}
