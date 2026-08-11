// B"H
// Boruch Hashem
// Blessed is He

const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

/**
 * @file Exercises canonical activation with fake systemd while protecting the old override on preflight failure.
 * @description The Awtsmoos arms rollback only after proof; Awtsmoos.com tests the vessel without touching a real service.
 */
const temporary = fs.mkdtempSync(path.join(os.tmpdir(), "awtsmoos-activate-"));
const repo = path.join(temporary, "repo");
const origin = path.join(temporary, "origin.git");
const bin = path.join(temporary, "bin");
const override = path.join(temporary, "override.conf");
const script = path.join(__dirname, "canonical-server-activate.sh");

try {
	setupRepo();
	setupShims();
	const sha = git(repo, "rev-parse", "HEAD");
	fs.writeFileSync(override, "OLD\n");
	fs.writeFileSync(path.join(repo, "dirty.txt"), "dirty\n");
	const refused = run(sha);
	assert.notEqual(refused.status, 0);
	assert.equal(fs.readFileSync(override, "utf8"), "OLD\n");
	fs.rmSync(path.join(repo, "dirty.txt"));
	const accepted = run(sha);
	assert.equal(accepted.status, 0, accepted.stderr);
	assert.match(fs.readFileSync(override, "utf8"), /WorkingDirectory=/);
	assert.match(accepted.stdout, /CANONICAL_SERVER_ACTIVE/);
	console.log(JSON.stringify({ ok: true, suite: "canonical-server-activation" }));
} finally {
	fs.rmSync(temporary, { recursive: true, force: true });
}

function setupRepo() {
	git(temporary, "init", "--bare", origin);
	git(temporary, "init", "-b", "main", repo);
	git(repo, "config", "user.email", "test@awtsmoos.com");
	git(repo, "config", "user.name", "Awtsmoos Test");
	fs.mkdirSync(path.join(repo, "ops", "systemd"), { recursive: true });
	fs.mkdirSync(path.join(repo, "users"), { recursive: true });
	fs.mkdirSync(path.join(repo, "geelooy", ".data"), { recursive: true });
	fs.writeFileSync(path.join(repo, "index.js"), "// B\"H\n");
	fs.writeFileSync(path.join(repo, "ops", "systemd", "awtsmoos-immutable.conf"), "[Service]\nWorkingDirectory=fixture\n");
	git(repo, "add", ".");
	git(repo, "commit", "-m", "fixture");
	git(repo, "remote", "add", "origin", origin);
	git(repo, "push", "-u", "origin", "main");
}

function setupShims() {
	fs.mkdirSync(bin, { recursive: true });
	write("systemctl", `#!/bin/sh\ncase "$1" in\nis-active) exit 0;;\nshow) case "$4" in WorkingDirectory) echo "$TEST_REPO";; ExecStart) echo "/usr/bin/node $TEST_REPO/index.js";; esac;;\n*) exit 0;;\nesac\n`);
	write("curl", "#!/bin/sh\nexit 0\n");
	write("install", "#!/bin/sh\nset -eu\nmkdir -p \"$(dirname \"$5\")\"\ncp \"$4\" \"$5\"\n");
}

function write(name, content) {
	fs.writeFileSync(path.join(bin, name), content, { mode: 0o755 });
}

function run(sha) {
	return spawnSync("bash", [script, sha], {
		encoding: "utf8",
		env: {
			...process.env,
			PATH: `${bin}:${process.env.PATH}`,
			TEST_REPO: repo,
			AWTSMOOS_PRODUCTION_REPO: repo,
			AWTSMOOS_SYSTEMD_OVERRIDE_PATH: override,
			TMPDIR: temporary
		}
	});
}

function git(repository, ...args) {
	const result = spawnSync("git", ["-C", repository, ...args], { encoding: "utf8" });
	if (result.status !== 0) throw new Error(result.stderr || result.stdout);
	return result.stdout.trim();
}
