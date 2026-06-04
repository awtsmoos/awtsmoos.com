// B"H

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { pathToFileURL } = require("url");

const { isCompactFlag } = require("../compactJs/flags.js");
const { parseJavaScript } = require("../compactJs/ast.js");
const { collectTopLevelModuleLinks, collectTopLevelImports } = require("../compactJs/imports.js");
const { compileCompactModule } = require("../compactJs/compiler.js");
const fileServer = require("../fileServer.js");

/**
 * B"H
 * These tests are lanterns placed along the new compact river. They verify the
 * real behavior of the generated module rather than assuming a flat source
 * shape: imports vanish, re-exports resolve, and the compiled ESM imports.
 *
 * @returns {Promise<void>} Resolves when all compact-JS tests pass.
 */
async function run() {
  assert.strictEqual(isCompactFlag("true"), true);
  assert.strictEqual(isCompactFlag(true), true);
  assert.strictEqual(isCompactFlag("false"), false);

  const ast = await parseJavaScript(
    "import { flame } from './flame.js';\nexport { glow } from './glow.js';\nconsole.log(flame);"
  );
  const imports = collectTopLevelImports(ast);
  const links = collectTopLevelModuleLinks(ast);
  assert.strictEqual(imports.length, 1);
  assert.strictEqual(imports[0].source, "./flame.js");
  assert.strictEqual(links.length, 2);

  const rootDir = await fs.mkdtemp(path.join(os.tmpdir(), "awts-compact-"));
  await fs.writeFile(path.join(rootDir, "flame.js"), "export const flame = 770;\n");
  await fs.writeFile(path.join(rootDir, "glow.js"), "export const glow = 331;\n");
  await fs.writeFile(
    path.join(rootDir, "entry.js"),
    "import { flame } from './flame.js';\nexport { glow } from './glow.js';\nexport const answer = flame + 1;\n"
  );

  const compiled = await compileCompactModule({
    fs,
    rootDir,
    entryFile: path.join(rootDir, "entry.js")
  });

  assert.match(compiled, /compact source: flame\.js/);
  assert.match(compiled, /compact source: glow\.js/);
  assert.match(compiled, /compact source: entry\.js/);
  assert.doesNotMatch(compiled, /from ['"]\.\//);

  const compiledPath = path.join(rootDir, "compiled.mjs");
  await fs.writeFile(compiledPath, compiled, "utf-8");
  const imported = await import(pathToFileURL(compiledPath).href + `?t=${Date.now()}`);
  assert.strictEqual(imported.answer, 771);
  assert.strictEqual(imported.glow, 331);

  assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext("true")), true);
  assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext("false")), false);
  assert.strictEqual(fileServer.shouldCompileCompactJs(makeParamKindContext("true")), true);
  assert.strictEqual(fileServer.isJavaScriptContentType("application/javascript"), true);
  assert.strictEqual(fileServer.isJavaScriptContentType("text/javascript"), true);
}

/**
 * B"H
 * Builds the smallest context vessel for the legacy request.yeser guard test.
 *
 * @param {string} compact Value assigned to request.yeser.compact.
 * @returns {object} Static-file context fragment.
 */
function makeContext(compact) {
  return {
    filePath: path.join("root", "entry.js"),
    contentType: "application/javascript",
    isDirectoryWithIndex: false,
    dependencies: {
      request: {
        method: "GET",
        yeser: { compact }
      }
    }
  };
}

/**
 * B"H
 * Builds the real newer server param vessel: dependencies.paramKinds.GET.
 *
 * @param {string} compact Value assigned to paramKinds.GET.compact.
 * @returns {object} Static-file context fragment.
 */
function makeParamKindContext(compact) {
  return {
    filePath: path.join("root", "entry.js"),
    contentType: "application/javascript",
    isDirectoryWithIndex: false,
    dependencies: {
      request: { method: "GET" },
      paramKinds: { GET: { compact } }
    }
  };
}

run()
  .then(() => console.log("B'H compactJs tests passed"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
