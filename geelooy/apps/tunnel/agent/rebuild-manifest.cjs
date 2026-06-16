// B"H
const fs = require("fs");
const path = require("path");

/**
 * B"H
 * Chapter 57:
 *
 * Every manifest regeneration creates a newer version.
 * The installer should never remain stuck on an old agent because
 * a version constant was forgotten.
 */

const ROOT = __dirname;
const REPO_ROOT = path.resolve(ROOT, "../../../..");
const OUT = path.join(ROOT, "manifest.txt");

const SKIP_DIRS = new Set([
  "node_modules",
  ".git",
  ".awtsmoos",
  ".cache",
  "testing",
  "test",
  "tests"
]);

const SKIP_NAMES = new Set([
  "manifest.txt"
]);

const EXTERNAL_DIRS = [
  {
    source: path.join(
      REPO_ROOT,
      "geelooy/ai/relay/split-browser"
    ),
    dest: "ai/relay/split-browser"
  }
];

function slash(value) {
  return String(value || "").replace(/\\/g, "/");
}

function readCurrentVersion() {
  try {
    const txt = fs.readFileSync(OUT, "utf8");

    const lines = txt
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(Boolean);

    const version = lines.find(
      line => /^\d+\.\d+\.\d+$/.test(line)
    );

    return version || null;
  } catch {
    return null;
  }
}

function nextVersion() {
  const forced =
    process.env.AWTSMOOS_AGENT_MANIFEST_VERSION;

  if (forced) {
    return forced;
  }

  const current = readCurrentVersion();

  if (!current) {
    return "1.0.1";
  }

  const [major, minor, patch] =
    current.split(".").map(Number);

  return `${major}.${minor}.${patch + 1}`;
}

function ignored(full, name) {
  if (
    SKIP_NAMES.has(name) ||
    SKIP_DIRS.has(name)
  ) {
    return true;
  }

  const s = slash(full);

  return (
    /(^|\/)testing(\/|$)/.test(s) ||
    /(^|\/)tests(\/|$)/.test(s) ||
    /(^|\/)test(\/|$)/.test(s) ||
    /\.test\.(cjs|mjs|js)$/.test(s) ||
    /\/\.tmp-/.test(s) ||
    /\/\.smoke-server/.test(s)
  );
}

function walk(
  dir,
  out = [],
  base = ROOT,
  prefix = ""
) {
  if (!fs.existsSync(dir)) {
    return out;
  }

  for (const entry of fs
    .readdirSync(dir, {
      withFileTypes: true
    })
    .sort((a, b) =>
      a.name.localeCompare(b.name)
    )) {

    const full = path.join(dir, entry.name);

    if (ignored(full, entry.name)) {
      continue;
    }

    if (entry.isDirectory()) {
      walk(full, out, base, prefix);
      continue;
    }

    if (entry.isFile()) {
      out.push(
        slash(
          path.join(
            prefix,
            path.relative(base, full)
          )
        )
      );
    }
  }

  return out;
}

function agentFiles() {
  return walk(ROOT)
    .filter(x => x !== "manifest.txt")
    .sort((a, b) => a.localeCompare(b));
}

function externalFiles() {
  const out = [];

  for (const item of EXTERNAL_DIRS) {
    walk(
      item.source,
      out,
      item.source,
      item.dest
    );
  }

  return out.sort((a, b) =>
    a.localeCompare(b)
  );
}

function buildManifest() {
  const version = nextVersion();

  const files = [
    ...new Set([
      ...agentFiles(),
      ...externalFiles()
    ])
  ].sort((a, b) =>
    a.localeCompare(b)
  );

  const lines = [
    'B"H',
    version,
    "main.js",
    "",
    ...files
  ];

  return {
    version,
    files,
    text: lines.join("\n") + "\n"
  };
}

function main() {
  const built = buildManifest();

  fs.writeFileSync(
    OUT,
    built.text,
    "utf8"
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        manifest: slash(
          path.relative(
            process.cwd(),
            OUT
          )
        ),
        version: built.version,
        files: built.files.length
      },
      null,
      2
    )
  );
}

if (require.main === module) {
  main();
}

module.exports = {
  buildManifest,
  walk,
  slash,
  agentFiles,
  externalFiles,
  ignored
};
