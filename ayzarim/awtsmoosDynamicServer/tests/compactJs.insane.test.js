// B"H

const assert = require("assert");
const fs = require("fs").promises;
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");
const { pathToFileURL } = require("url");
const { compileCompactModule } = require("../compactJs/compiler.js");

/**
 * B"H
 * The Insane Compact Furnace throws strange but valid module scrolls into the
 * compiler: nested template palaces, same-line exports, export stars, alias
 * rivers, side-effect sparks, default objects, dynamic imports, comments that
 * pretend to be syntax, and regex chambers. The Awtsmoos tests the boundary
 * where parser offsets tremble, so the compact server can stand in daylight.
 */
async function run() {
  await runCase("same-line-exports", {
    "entry.js": `export const a = 1; export function b(x = { y: 2 }) { return a + x.y; } export class C { m(){ return b(); } }`
  }, async (mod) => {
    assert.strictEqual(mod.a, 1);
    assert.strictEqual(mod.b(), 3);
    assert.strictEqual(new mod.C().m(), 3);
  });

  await runCase("nested-template-default", {
    "css.js": "export default /*css*/`\\n.x{content:'${`nested-${1+1}`}'}\\n.y{background:url(\\`tick\\`)}\\n`;",
    "entry.js": "import css from './css.js'; export const ok = css.includes('nested-2') && css.includes('tick');"
  }, async (mod) => assert.strictEqual(mod.ok, true));

  await runCase("export-star-chain", {
    "a.js": "export const aleph = 1; export const beis = 2;",
    "b.js": "export * from './a.js'; export const gimel = 3;",
    "entry.js": "export * from './b.js'; export const daled = 4;"
  }, async (mod) => assert.deepStrictEqual([mod.aleph, mod.beis, mod.gimel, mod.daled], [1, 2, 3, 4]));

  await runCase("alias-and-side-effect", {
    "setup.js": "globalThis.__compactInsane = ['spark']; export const ignored = 1;",
    "names.js": "const inner = 7; export { inner as renamed };",
    "entry.js": "import './setup.js'; import { renamed } from './names.js'; export const value = globalThis.__compactInsane[0] + renamed;"
  }, async (mod) => {
    assert.strictEqual(mod.value, "spark7");
    delete globalThis.__compactInsane;
  });

  await runCase("default-object-with-comments-regex", {
    "entry.js": `const rx = /\\{notABrace\\}/g; export default { rx, text: "a; export default fake", nested: { ok: true } }; export const after = rx.test("{notABrace}");`
  }, async (mod) => {
    assert.strictEqual(mod.default.nested.ok, true);
    assert.strictEqual(mod.after, true);
  });

  await runCase("dynamic-import-left-alone", {
    "entry.js": "export async function loader(){ return import('./later.js'); } export const alive = true;",
    "later.js": "export const later = 10;"
  }, async (mod) => assert.strictEqual(mod.alive, true));

  await runCase("destructure-export", {
    "entry.js": "export const { a, b: { c } } = { a: 5, b: { c: 6 } }; export const total = a + c;"
  }, async (mod) => assert.strictEqual(mod.total, 11));

  console.log("B'H insane compact stress tests passed");
}

async function runCase(name, files, verify) {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), `awts-insane-${name}-`));
  for (const [file, source] of Object.entries(files)) {
    const target = path.join(root, file);
    await fs.mkdir(path.dirname(target), { recursive: true });
    await fs.writeFile(target, source, "utf8");
  }
  const compiled = await compileCompactModule({ fs, rootDir: root, entryFile: path.join(root, "entry.js") });
  const output = path.join(root, "compiled.mjs");
  await fs.writeFile(output, compiled, "utf8");
  execFileSync(process.execPath, ["--check", output]);
  const mod = await import(pathToFileURL(output).href + `?t=${Date.now()}`);
  await verify(mod, compiled);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
