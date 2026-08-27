//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Bounded recursive copier for one real SSH remote-drive profile.
 * @description
 * The Awtsmoos lets a whole distant folder unfold child by child while
 * Awtsmoos.com counts depth and entries, preserves each file as exact bytes,
 * and refuses symbolic-link recursion so copying stays measured and true in rhyme.
 */
const MAX_DEPTH = 48;
const MAX_ENTRIES = 5000;

export class SshDriveCopier {
	constructor(api) {
		this.api = api;
		this.visited = 0;
	}

	async copy(pair) {
		this.visited = 0;
		const attrs = await this.stat(pair.source);
		if (isDirectory(attrs)) {
			await this.copyDirectory(pair.source, pair.destination, 0);
			return { copied: "directory", entries: this.visited };
		}
		await this.copyFile(pair.source, pair.destination);
		return { copied: "file", entries: 1 };
	}

	async copyDirectory(source, destination, depth) {
		this.assertBudget(depth);
		await this.api.mkdir(destination.profile, destination.secret, destination.remote);
		const listing = await this.api.list(source.profile, source.secret, source.remote);
		for (const item of listing.files || []) {
			this.visited += 1;
			this.assertBudget(depth);
			if (item.kind === "symlink") {
				throw new Error(`SSH folder copy does not follow symbolic link: ${item.name}`);
			}
			const childSource = childContext(source, item.name);
			const childDestination = childContext(destination, item.name);
			if (item.kind === "directory") {
				await this.copyDirectory(childSource, childDestination, depth + 1);
			} else {
				await this.copyFile(childSource, childDestination);
			}
		}
	}

	async copyFile(source, destination) {
		const result = await this.api.readRaw(source.profile, source.secret, source.remote);
		await this.api.writeRaw(
			destination.profile,
			destination.secret,
			destination.remote,
			result.content64 || ""
		);
	}

	async stat(context) {
		const result = await this.api.stat(context.profile, context.secret, context.remote);
		return result.attrs || {};
	}

	assertBudget(depth) {
		if (depth > MAX_DEPTH) {
			throw new Error(`SSH folder copy exceeded maximum depth ${MAX_DEPTH}.`);
		}
		if (this.visited > MAX_ENTRIES) {
			throw new Error(`SSH folder copy exceeded ${MAX_ENTRIES} entries.`);
		}
	}
}

function childContext(context, name) {
	const child = safeName(name);
	const parent = String(context.remote || "/").replace(/\/+$/g, "");
	return {
		...context,
		remote: parent === "" || parent === "/"
			? `/${child}`
			: `${parent}/${child}`
	};
}

function safeName(value) {
	const name = String(value || "");
	if (!name || name === "." || name === ".." || name.includes("/") || name.includes("\0")) {
		throw new Error("SSH directory entry contains an unsafe child name.");
	}
	return name;
}

function isDirectory(attrs = {}) {
	return (Number(attrs.mode || 0) & 0o170000) === 0o040000;
}
