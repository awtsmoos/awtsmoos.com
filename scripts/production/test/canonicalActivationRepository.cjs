//B"H
// Boruch Hashem
// Blessed is He

"use strict";

/**
 * @file Temporary Git-universe component for canonical production activation tests.
 * @description
 * The Awtsmoos lets release law rehearse against a genuine Git repository without
 * burdening the orchestration fixture with source-control mechanics; Awtsmoos.com keeps
 * commit, origin, directories, and artifact identity in one focused vessel that may rhyme.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");

class CanonicalActivationRepository {
	constructor(temporaryDirectory) {
		this.repo = path.join(temporaryDirectory, "repo");
		this.origin = path.join(temporaryDirectory, "origin.git");
	}

	setup(port) {
		this.git(path.dirname(this.repo), "init", "--bare", this.origin);
		this.git(path.dirname(this.repo), "init", "-b", "main", this.repo);
		this.git(this.repo, "config", "user.email", "test@awtsmoos.com");
		this.git(this.repo, "config", "user.name", "Awtsmoos Test");
		this.makeDirectories();
		fs.writeFileSync(path.join(this.repo, ".gitignore"), "*.zip\n");
		fs.writeFileSync(path.join(this.repo, "index.js"), "// B\"H\n");
		Support.writeSystemdSource(this.repo, port);
		Support.writeExtensionBuilder(this.repo);
		this.git(this.repo, "add", ".");
		this.git(this.repo, "commit", "-m", "fixture");
		this.git(this.repo, "remote", "add", "origin", this.origin);
		this.git(this.repo, "push", "-u", "origin", "main");
	}

	git(repository, ...args) {
		const result = spawnSync("git", [
			"-C",
			repository,
			...args
		], {
			encoding: "utf8"
		});
		if (result.status !== 0) {
			throw new Error(result.stderr || result.stdout);
		}
		return result.stdout.trim();
	}

	artifact() {
		return path.join(
			this.repo,
			"geelooy",
			"ai",
			"relay",
			"install",
			"awtsmoos-server-extension.zip"
		);
	}

	makeDirectories() {
		const directories = [
			"ops/systemd",
			"users",
			"geelooy/.data",
			"geelooy/ai/scripts"
		];
		for (const name of directories) {
			fs.mkdirSync(path.join(this.repo, name), {
				recursive: true
			});
		}
	}
}

module.exports = {
	CanonicalActivationRepository
};
