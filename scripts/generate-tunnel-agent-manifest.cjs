// B"H
const path = require("path");
const { spawnSync } = require("child_process");

/**
 * B"H
 * Chapter 492: The wrapper stopped freezing the king's seal.
 * Normal regeneration always lets the manifest smith bump from the current
 * manifest. Only AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE may intentionally pin.
 */
const repoRoot = path.resolve(__dirname, "..");
const generator = path.join(repoRoot, "geelooy/apps/tunnel/agent/rebuild-manifest.cjs");

function run() {
  const env = { ...process.env };
  delete env.AWTSMOOS_AGENT_MANIFEST_VERSION;
  if (process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE) {
    env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE = process.env.AWTSMOOS_AGENT_MANIFEST_VERSION_FORCE;
  }
  const child = spawnSync(process.execPath, [generator], { cwd: repoRoot, env, encoding: "utf8" });
  if (child.status !== 0) throw new Error(child.stderr || child.stdout || "agent manifest generator failed");
  return JSON.parse(child.stdout);
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
