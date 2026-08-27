// B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Strict root-jailed filesystem adapter for tunnel-agent fake SSH and SFTP.
 * @description
 * The Awtsmoos lets virtual paths reach real project bytes only through guarded
 * helpers. Awtsmoos.com keeps listing, stat, read, bounded write, empty-directory
 * removal, and collision-safe rename explicit, so destructive shortcuts cannot rhyme.
 */
const fsp = require("fs/promises");
const path = require("path");
const Metadata = require("./sftpMetadata.js");
const PathLaw = require("./sftpPath.js");
const Shell = require("./shell.js");

async function readdir(config, cwd, target) {
	const resolved = PathLaw.resolve(config, cwd, target, { allowSynthetic: true });
	if (resolved.synthetic) {
		return Shell.rootEntries(config);
	}
	const entries = await fsp.readdir(resolved.real, { withFileTypes: true });
	const visible = [];
	for (const entry of entries) {
		try {
			PathLaw.resolve(config, resolved.virtual, entry.name);
			visible.push({
				filename: entry.name,
				longname: `${entry.name}${entry.isDirectory() ? "/" : ""}`,
				attrs: Metadata.entryAttrs(entry)
			});
		} catch (_) {
			// B"H: secret or escaping symlink entries remain veiled from the remote eye.
		}
	}
	return visible;
}

async function stat(config, cwd, target) {
	const resolved = PathLaw.resolve(config, cwd, target, { allowSynthetic: true });
	if (resolved.synthetic) {
		return Metadata.syntheticDirectory();
	}
	return Metadata.statAttrs(await fsp.stat(resolved.real));
}

async function readFile(config, cwd, target, encoding = null) {
	const resolved = PathLaw.resolve(config, cwd, target);
	return {
		path: resolved.virtual,
		content: await fsp.readFile(resolved.real, encoding || null)
	};
}

async function writeFile(config, cwd, target, content) {
	PathLaw.requireWrite(config);
	const bytes = PathLaw.assertWriteSize(content);
	const resolved = PathLaw.resolve(config, cwd, target);
	await fsp.mkdir(path.dirname(resolved.real), { recursive: true });
	await fsp.writeFile(resolved.real, content);
	return { path: resolved.virtual, bytes };
}

async function mkdir(config, cwd, target) {
	PathLaw.requireWrite(config);
	const resolved = PathLaw.resolve(config, cwd, target);
	await fsp.mkdir(resolved.real);
	return { path: resolved.virtual };
}

async function remove(config, cwd, target) {
	PathLaw.requireWrite(config);
	const resolved = PathLaw.resolve(config, cwd, target);
	const attrs = await fsp.stat(resolved.real);
	if (attrs.isDirectory()) {
		const entries = await fsp.readdir(resolved.real);
		if (entries.length) {
			throw new Error("fake_ssh_directory_not_empty");
		}
		await fsp.rmdir(resolved.real);
	} else {
		await fsp.unlink(resolved.real);
	}
	return { path: resolved.virtual };
}

async function rename(config, cwd, from, to) {
	PathLaw.requireWrite(config);
	const source = PathLaw.resolve(config, cwd, from);
	const target = PathLaw.resolve(config, cwd, to);
	await assertDestinationMissing(target.real);
	await fsp.mkdir(path.dirname(target.real), { recursive: true });
	await fsp.rename(source.real, target.real);
	return { from: source.virtual, to: target.virtual };
}

async function assertDestinationMissing(target) {
	try {
		await fsp.stat(target);
		throw new Error("fake_ssh_rename_destination_exists");
	} catch (error) {
		if (error?.message === "fake_ssh_rename_destination_exists") {
			throw error;
		}
		if (error?.code !== "ENOENT") {
			throw error;
		}
	}
}

module.exports = {
	mkdir,
	readFile,
	readdir,
	remove,
	rename,
	stat,
	writeFile
};
