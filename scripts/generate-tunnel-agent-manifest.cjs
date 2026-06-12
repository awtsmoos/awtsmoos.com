// B"H
const path = require("path");
const { spawnSync } = require("child_process");

/**
 * B"H
 * Chapter 407: One manifest smith remained.
 * The public artifact forge delegates to the agent-local generator, because it
 * knows both the agent tree and the external relay files that must land under
 * `/ai` in the installed tunnel root.
 */
const repoRoot = path.resolve(__dirname, "..");
const generator = path.join(repoRoot, "geelooy/apps/tunnel/agent/rebuild-manifest.cjs");

function run() {
  const child = spawnSync(process.execPath, [generator], {
    cwd: repoRoot,
    env: { ...process.env, AWTSMOOS_AGENT_MANIFEST_VERSION: process.env.AWTSMOOS_AGENT_MANIFEST_VERSION || "1.0.53" },
    encoding: "utf8"
  });
  if (child.status !== 0) throw new Error(child.stderr || child.stdout || "agent manifest generator failed");
  return JSON.parse(child.stdout);
}

if (require.main === module) console.log(JSON.stringify(run(), null, 2));
module.exports = { run };
