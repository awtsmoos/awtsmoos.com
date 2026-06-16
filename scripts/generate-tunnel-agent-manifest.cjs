// B"H
const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

/**
 * B"H
 * Chapter 407: The manifest learned how to remember time.
 *
 * Every regeneration produces a newer manifest version.
 * The tunnel installer should never remain stuck because the
 * version was hardcoded in a generator wrapper.
 */

const repoRoot = path.resolve(__dirname, "..");
const generator = path.join(
  repoRoot,
  "geelooy/apps/tunnel/agent/rebuild-manifest.cjs"
);

const manifestPath = path.join(
  repoRoot,
  "geelooy/apps/tunnel/agent/manifest.txt"
);

function currentManifestVersion() {
  try {
    const txt = fs.readFileSync(manifestPath, "utf8");

    const lines = txt
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(Boolean);

    const versionLine = lines.find(
      line => /^\d+\.\d+\.\d+$/.test(line)
    );

    if (versionLine) {
      return versionLine;
    }
  } catch {}

  return null;
}

function nextVersion() {
  const existing = currentManifestVersion();

  if (!existing) {
    return `1.0.${Date.now()}`;
  }

  const parts = existing.split(".").map(Number);

  if (parts.length !== 3) {
    return `1.0.${Date.now()}`;
  }

  return `${parts[0]}.${parts[1]}.${parts[2] + 1}`;
}

function run() {
  const version =
    process.env.AWTSMOOS_AGENT_MANIFEST_VERSION ||
    nextVersion();

  const child = spawnSync(
    process.execPath,
    [generator],
    {
      cwd: repoRoot,
      env: {
        ...process.env,
        AWTSMOOS_AGENT_MANIFEST_VERSION: version
      },
      encoding: "utf8"
    }
  );

  if (child.status !== 0) {
    throw new Error(
      child.stderr ||
      child.stdout ||
      "agent manifest generator failed"
    );
  }

  const result = JSON.parse(child.stdout);

  return {
    ...result,
    version
  };
}

if (require.main === module) {
  console.log(JSON.stringify(run(), null, 2));
}

module.exports = { run };
