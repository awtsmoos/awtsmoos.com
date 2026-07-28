// B"H

const assert = require("assert");
const childProcess = require("child_process");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { compileCompactModule } = require("../compactJs/compiler.js");

/**
 * B"H
 * Compiles the real deferred Mitzvah World feature graph. This guards the
 * package boundary that prevents hundreds of browser module requests without
 * placing the native first-playable launcher inside the transformed universe.
 */
async function run() {
  const repoRoot = path.resolve(__dirname, "../../..");
  const rootDir = path.join(repoRoot, "geelooy");
  const runtimeFile = path.join(
    rootDir,
    "games/mitzvahWorld/experiments/Awtsmoos/src/app/createMinimalMeadowRuntime.js"
  );
  const entryFile = path.join(
    rootDir,
    "games/mitzvahWorld/experiments/Awtsmoos/src/app/MinimalMeadowFeatureBundle.js"
  );
  const runtimeSource = await fs.readFile(runtimeFile, "utf8");
  assert.match(
    runtimeSource,
    /import\(['"]\.\/MinimalMeadowFeatureBundle\.js\?compact=true['"]\)/
  );

  const compactSource = await compileCompactModule({ fs, entryFile, rootDir });
  assert.match(compactSource, /export const installMinimalMeadowFeatures/);
  assert.doesNotMatch(
    compactSource,
    /^import[\s\S]{0,180}?from\s+["']\.?\.?\//m
  );

  const target = path.join(
    os.tmpdir(),
    `awtsmoos-mitzvah-feature-${process.pid}.mjs`
  );
  try {
    await fs.writeFile(target, compactSource);
    childProcess.execFileSync(process.execPath, ["--check", target], {
      stdio: "pipe"
    });
  } finally {
    await fs.unlink(target).catch(() => {});
  }

  console.log("B'H Mitzvah compact feature graph test passed");
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
