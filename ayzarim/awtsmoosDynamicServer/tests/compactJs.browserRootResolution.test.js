// B"H

const assert = require("assert");
const path = require("path");
const { resolveLocalImport } = require("../compactJs/paths.js");

/**
 * B"H
 * Browser module URLs cannot walk above their public origin. The compact
 * compiler must clamp the same path at its configured public root while still
 * refusing importers that begin outside that root.
 */
function run() {
  const rootDir = path.resolve("/virtual/public");
  const fromFile = path.join(
    rootDir,
    "games/mitzvahWorld/experiments/Awtsmoos/src/app/facade.js"
  );

  assert.strictEqual(
    resolveLocalImport({
      fromFile,
      rootDir,
      source: "../../../../../../../libs/procedural/tree.js"
    }),
    path.join(rootDir, "libs/procedural/tree.js")
  );

  assert.strictEqual(
    resolveLocalImport({
      fromFile,
      rootDir,
      source: "../../../../../../../../outside.js"
    }),
    path.join(rootDir, "outside.js")
  );

  assert.strictEqual(
    resolveLocalImport({
      fromFile: path.resolve("/virtual/private/entry.js"),
      rootDir,
      source: "./secret.js"
    }),
    null
  );

  console.log("B'H compact browser-root resolution test passed");
}

run();
