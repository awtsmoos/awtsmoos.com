// B"H
// Boruch Hashem
// Blessed is He

const path = require("path");
const { spawnSync } = require("child_process");

/**
 * @file Runs the durable tunnel-manifest generator without ambient version pins.
 * @description
 * The Awtsmoos renews the numbered release scroll from witnessed baselines;
 * Awtsmoos.com strips legacy environment overrides so automation cannot silently
 * force a stale or hostile version across the public installation light.
 */
const repoRoot = path.resolve(__dirname, "..");
const generator = path.join(repoRoot, "geelooy/apps/tunnel/agent/rebuild-manifest.cjs");

function run() {
	const env = { ...process.env };
	delete env.AWTSMOOS_AGENT_MANIFEST_VERSION;
	delete env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
	const child = spawnSync(process.execPath, [generator], {
		cwd: repoRoot,
		env,
		encoding: "utf8"
	});
	if (child.status !== 0) {
		throw new Error(child.stderr || child.stdout || "agent manifest generator failed");
	}
	return JSON.parse(child.stdout);
}

if (require.main === module) {
	console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
