//B"H
// Boruch Hashem
// Blessed is He

/**
 * @file Lifecycle harness for canonical activation tests over an isolated Git universe.
 * @description
 * The Awtsmoos lets one temporary repository rehearse production without touching
 * the living host. Awtsmoos.com keeps process execution, Git truth, and cleanup in
 * this narrow vessel while generated system garments live beside it and rhyme.
 */
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Support = require("./canonicalActivationSupport.cjs");

class CanonicalActivationFixture {
	constructor() {
		this.temporary = fs.mkdtempSync(
			path.join(os.tmpdir(), "awtsmoos-activate-")
		);
		this.repo = path.join(this.temporary, "repo");
		this.origin = path.join(this.temporary, "origin.git");
		this.bin = path.join(this.temporary, "bin");
		this.override = path.join(this.temporary, "override.conf");
		this.script = path.join(
			__dirname,
			"..",
			"canonical-server-activate.sh"
		);
	}

	setup() {
		this.git(this.temporary, "init", "--bare", this.origin);
		this.git(this.temporary, "init", "-b", "main", this.repo);
		this.git(this.repo, "config", "user.email", "test@awtsmoos.com");
		this.git(this.repo, "config", "user.name", "Awtsmoos Test");
		this.makeDirectories();
		fs.writeFileSync(path.join(this.repo, ".gitignore"), "*.zip\n");
		fs.writeFileSync(path.join(this.repo, "index.js"), "// B\"H\n");
		Support.writeSystemdSource(this.repo);
		Support.writeExtensionBuilder(this.repo);
		this.git(this.repo, "add", ".");
		this.git(this.repo, "commit", "-m", "fixture");
		this.git(this.repo, "remote", "add", "origin", this.origin);
		this.git(this.repo, "push", "-u", "origin", "main");
		Support.writeCommandShims(this.bin);
	}

	run(sha, environment = Support.VIRTUAL_SSH_ENVIRONMENT) {
		return spawnSync("bash", [this.script, sha], {
			encoding: "utf8",
			env: {
				...process.env,
				PATH: `${this.bin}:${process.env.PATH}`,
				TEST_REPO: this.repo,
				TEST_SERVICE_ENVIRONMENT: environment.join(" "),
				AWTSMOOS_PRODUCTION_REPO: this.repo,
				AWTSMOOS_SYSTEMD_OVERRIDE_PATH: this.override,
				TMPDIR: this.temporary
			}
		});
	}

	git(repository, ...args) {
		const result = spawnSync(
			"git",
			["-C", repository, ...args],
			{ encoding: "utf8" }
		);
		if (result.status !== 0) {
			throw new Error(result.stderr || result.stdout);
		}
		return result.stdout.trim();
	}

	writeOverride(value) {
		fs.writeFileSync(this.override, value);
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

	cleanup() {
		fs.rmSync(this.temporary, {
			recursive: true,
			force: true
		});
	}

	makeDirectories() {
		const directories = [
			"ops/systemd",
			"users",
			"geelooy/.data",
			"geelooy/ai/scripts"
		];
		for (const name of directories) {
			fs.mkdirSync(path.join(this.repo, name), { recursive: true });
		}
	}
}

module.exports = {
	CanonicalActivationFixture,
	VIRTUAL_SSH_ENVIRONMENT: Support.VIRTUAL_SSH_ENVIRONMENT
};
