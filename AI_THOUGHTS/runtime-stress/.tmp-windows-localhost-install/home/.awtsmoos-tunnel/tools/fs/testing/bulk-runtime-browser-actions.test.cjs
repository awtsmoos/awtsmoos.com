// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const path = require("path");

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "apps/tunnel/agent/main.js"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate geelooy public root from " + start);
}

const repoRoot = findPublicRoot(__dirname);
const fsRoot = path.join(__dirname, ".tmp-bulk-runtime-browser-actions");
const { buildActions } = require(path.join(repoRoot, "apps/tunnel/agent/tools/fs/actions.js"));

function config() {
  return { root: fsRoot, allowWrite: true, allowSecrets: false, tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true, fsTree: true } };
}

async function resetFixture() {
  await fsp.rm(fsRoot, { recursive: true, force: true });
  await fsp.mkdir(path.join(fsRoot, "deep"), { recursive: true });
  await fsp.writeFile(path.join(fsRoot, "one.txt"), "B'H one", "utf8");
  await fsp.writeFile(path.join(fsRoot, "deep", "two.txt"), "B'H two", "utf8");
}

async function runFs(action, payload = {}) {
  const full = { action, ...payload };
  const actions = buildActions(config(), full, null);
  assert.equal(typeof actions[action], "function", `missing action ${action}`);
  return await actions[action]();
}

/**
 * B"H
 * Chapter 13: Bulk read and bulk write entered the furnace together.
 * It verifies newline paths, array paths, writes[], and files{}.
 */
async function assertBulkReadWriteShapes() {
  const newlineBulk = await runFs("bulk", { paths: "one.txt\ndeep/two.txt", maxFiles: 5 });
  assert.equal(newlineBulk.ok, true);
  assert.equal(newlineBulk.returnedCount, 2);
  assert.equal(newlineBulk.files["one.txt"].content, "B'H one");

  const arrayBulk = await runFs("bulk", { paths: ["one.txt", "deep/two.txt"], maxFiles: 5 });
  assert.equal(arrayBulk.returnedCount, 2);

  const writeArray = await runFs("bulkWrite", { writes: [{ path: "a.txt", content: "Alef" }, { path: "b.txt", content: "Beis" }] });
  assert.equal(writeArray.ok, true);
  assert.equal(writeArray.okCount, 2);

  const writeFiles = await runFs("bulkWrite", { files: { "c.txt": "Gimmel", "deep/d.txt": "Dalet" } });
  assert.equal(writeFiles.ok, true);
  assert.equal(writeFiles.okCount, 2);

  const confirm = await runFs("bulk", { paths: ["a.txt", "b.txt", "c.txt", "deep/d.txt"], maxFiles: 10 });
  assert.equal(confirm.returnedCount, 4);
  assert.equal(confirm.files["deep/d.txt"].content, "Dalet");
}

/**
 * B"H
 * Chapter 14: The Merkava browser accepted one JSON scroll and judged it.
 * It clicks, fills, waits, evaluates, snapshots, and catches selector errors.
 */
async function assertBrowserJsonActions() {
  const html = `<body><input id="name"><button id="go">Go</button><div id="out">empty</div><script>
    document.getElementById('name').addEventListener('input', e => window.typed = e.target.value);
    document.getElementById('go').addEventListener('click', () => {
      document.getElementById('out').textContent = 'Hello ' + document.getElementById('name').value;
      window.clicked = true;
    });
  </script></body>`;
  const browserActions = [
    { action: "waitForSelector", selector: "#name", timeoutMs: 20 },
    { action: "fill", selector: "#name", value: "Dovid" },
    { action: "click", selector: "#go" },
    { action: "assertText", selector: "#out", expected: "Hello Dovid" },
    { action: "assertValue", selector: "#name", expected: "Dovid" },
    { action: "evaluate", source: "document.querySelector('#out').textContent" },
    { action: "snapshot" }
  ];
  const sim = await runFs("simulateRuntime", { runtime: "browser", engine: "merkava", entry: "index.html", html, browserActions, returnValues: ["window.clicked", "window.typed"] });
  assert.equal(sim.ok, true, JSON.stringify(sim.errors || sim.result?.errors || []));
  assert.equal(sim.interactionLog.length, browserActions.length);
  assert.equal(sim.interactionLog[5].value, "Hello Dovid");
  assert.equal(sim.values["window.clicked"], true);
  assert.equal(sim.values["window.typed"], "Dovid");

  const failed = await runFs("simulateRuntime", { runtime: "browser", engine: "merkava", entry: "index.html", html, browserActions: [{ action: "click", selector: "#missing" }] });
  assert.equal(failed.ok, false);
  assert.ok(JSON.stringify(failed.errors || failed.result?.errors || []).includes("#missing"));
}

(async () => {
  await resetFixture();
  await assertBulkReadWriteShapes();
  await assertBrowserJsonActions();
  console.log(JSON.stringify({ ok: true, tests: 2, fixture: fsRoot }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
