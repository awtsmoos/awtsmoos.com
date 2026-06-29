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
 * Chapter of the Compact Flame: the Awtsmoos bends local scrolls into one
 * vessel, and these tests hammer the vessel with CSS backticks, side-effect
 * imports, aliases, residual vendor export lists, and real game entry points.
 *
 * @returns {Promise<void>} Resolves when all compact-JS stress tests pass.
 */
async function run() {
  assert.strictEqual(isCompactFlag("true"), true);
  assert.strictEqual(isCompactFlag(true), true);
  assert.strictEqual(isCompactFlag("false"), false);
  await testAstLinkCollection();
  await testSimpleLocalGraph();
  await testTemplateLiteralDefaultExport();
  await testLogicalExpressionDefaultExport();
  await testResidualVendorExportList();
  await testSideEffectImportAndAliases();
  await testServerCompactGuards();
  await testRealGameEntrySyntax();
}

async function testAstLinkCollection() {
  const ast = await parseJavaScript(
    "import { flame } from './flame.js';\nexport { glow } from './glow.js';\nconsole.log(flame);"
  );
  const imports = collectTopLevelImports(ast);
  const links = collectTopLevelModuleLinks(ast);
  assert.strictEqual(imports.length, 1);
  assert.strictEqual(imports[0].source, "./flame.js");
  assert.strictEqual(links.length, 2);
}

async function testSimpleLocalGraph() {
  const rootDir = await makeTempRoot();
  await fs.writeFile(path.join(rootDir, "flame.js"), "export const flame = 770;\n");
  await fs.writeFile(path.join(rootDir, "glow.js"), "export const glow = 331;\n");
  await fs.writeFile(path.join(rootDir, "entry.js"), [
    "import { flame } from './flame.js';",
    "export { glow } from './glow.js';",
    "export const answer = flame + 1;"
  ].join("\n"));

  const imported = await compileAndImport(rootDir, "entry.js");
  assert.strictEqual(imported.answer, 771);
  assert.strictEqual(imported.glow, 331);
}

async function testTemplateLiteralDefaultExport() {
  const rootDir = await makeTempRoot();
  await fs.writeFile(path.join(rootDir, "style.js"), [
    "export default /*css*/`",
    "  .instructions { color: red; }",
    "  .slot::after { content: '\\`escaped\\`'; }",
    "  .value::before { content: '${(() => `nested`)()}'; }",
    "`;"
  ].join("\n"));
  await fs.writeFile(path.join(rootDir, "entry.js"), [
    "import skin from './style.js';",
    "export const hasInstructions = skin.includes('.instructions');"
  ].join("\n"));

  const imported = await compileAndImport(rootDir, "entry.js");
  assert.strictEqual(imported.hasInstructions, true);
}

async function testLogicalExpressionDefaultExport() {
  const rootDir = await makeTempRoot();
  await fs.writeFile(path.join(rootDir, "runtime.js"), [
    "const scope = globalThis;",
    "scope.__compactRuntime ||= { ok:true };",
    "export default scope.__compactRuntime || null;"
  ].join("\n"));
  await fs.writeFile(path.join(rootDir, "entry.js"), [
    "import runtime from './runtime.js';",
    "export const ok = runtime.ok === true;"
  ].join("\n"));

  const compiled = await compileSource(rootDir, "entry.js");
  assert.doesNotMatch(compiled, /=\s*\|\|/);
  const imported = await importSource(rootDir, compiled);
  assert.strictEqual(imported.ok, true);
  delete globalThis.__compactRuntime;
}

async function testResidualVendorExportList() {
  const rootDir = await makeTempRoot();
  await fs.writeFile(path.join(rootDir, "vendor.js"), [
    "const Alpha = 1;",
    "const Beta = 2;",
    "export { Alpha, Beta as Gamma };"
  ].join("\n"));
  await fs.writeFile(path.join(rootDir, "entry.js"), [
    "import { Alpha, Gamma } from './vendor.js';",
    "export const total = Alpha + Gamma;"
  ].join("\n"));

  const compiled = await compileSource(rootDir, "entry.js");
  assert.doesNotMatch(compiled, /\n\s*export\s*\{/);
  const imported = await importSource(rootDir, compiled);
  assert.strictEqual(imported.total, 3);
}

async function testSideEffectImportAndAliases() {
  const rootDir = await makeTempRoot();
  await fs.writeFile(path.join(rootDir, "setup.js"), "globalThis.__awtsCompactSide = 40;\nexport const x = 2;\n");
  await fs.writeFile(path.join(rootDir, "alias.js"), "export const inner = 8;\nexport { inner as renamed };\n");
  await fs.writeFile(path.join(rootDir, "entry.js"), [
    "import './setup.js';",
    "import { renamed } from './alias.js';",
    "export const total = globalThis.__awtsCompactSide + renamed;"
  ].join("\n"));

  const imported = await compileAndImport(rootDir, "entry.js");
  assert.strictEqual(imported.total, 48);
  delete globalThis.__awtsCompactSide;
}

async function testServerCompactGuards() {
  assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext("true")), true);
  assert.strictEqual(fileServer.shouldCompileCompactJs(makeContext("false")), false);
  assert.strictEqual(fileServer.shouldCompileCompactJs(makeParamKindContext("true")), true);
  assert.strictEqual(fileServer.isJavaScriptContentType("application/javascript"), true);
  assert.strictEqual(fileServer.isJavaScriptContentType("text/javascript"), true);
}

async function testRealGameEntrySyntax() {
  const repo = path.resolve(__dirname, "../../..");
  const entries = [
    "geelooy/games/brick-blast/index.js",
    "geelooy/games/brick-blast/js/main.js",
    "geelooy/games/cards/js/main.js",
    "geelooy/games/chess/main.js",
    "geelooy/games/connect4/main.js",
    "geelooy/games/kabbalah-shooter/main.js",
    "geelooy/games/mitzvahWorld/index.js",
    "geelooy/games/mitzvahWorld/ckidsAwtsmoos/ikar.js"
  ];
  for (const entry of entries) {
    const compiled = await compileCompactModule({ fs, rootDir: path.join(repo, "geelooy"), entryFile: path.join(repo, entry) });
    await assertSyntax(compiled, path.basename(entry));
  }
}

async function compileAndImport(rootDir, entry) {
  return importSource(rootDir, await compileSource(rootDir, entry));
}

async function compileSource(rootDir, entry) {
  return compileCompactModule({ fs, rootDir, entryFile: path.join(rootDir, entry) });
}

async function importSource(rootDir, source) {
  const compiledPath = path.join(rootDir, `compiled-${Date.now()}-${Math.random()}.mjs`);
  await fs.writeFile(compiledPath, source, "utf-8");
  return import(pathToFileURL(compiledPath).href + `?t=${Date.now()}`);
}

async function assertSyntax(source, label) {
  const tmp = await makeTempRoot();
  const target = path.join(tmp, `${label}.mjs`);
  await fs.writeFile(target, source, "utf-8");
  await import("child_process").then(({ execFileSync }) => execFileSync(process.execPath, ["--check", target]));
}

function makeContext(compact) {
  return {
    filePath: path.join("root", "entry.js"),
    contentType: "application/javascript",
    isDirectoryWithIndex: false,
    dependencies: { request: { method: "GET", yeser: { compact } } }
  };
}

function makeParamKindContext(compact) {
  return {
    filePath: path.join("root", "entry.js"),
    contentType: "application/javascript",
    isDirectoryWithIndex: false,
    dependencies: { request: { method: "GET" }, paramKinds: { GET: { compact } } }
  };
}

function makeTempRoot() {
  return fs.mkdtemp(path.join(os.tmpdir(), "awts-compact-"));
}

run()
  .then(() => console.log("B'H compactJs stress tests passed"))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
