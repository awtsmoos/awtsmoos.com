// B"H
const assert = require("assert");
const fs = require("fs");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { spawnSync } = require("child_process");

function findPublicRoot(start) {
  let dir = start;
  while (dir && dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, "apps/tunnel/agent/main.js"))) return dir;
    dir = path.dirname(dir);
  }
  throw new Error("Could not locate geelooy public root from " + start);
}

const repoRoot = findPublicRoot(__dirname);
const appRoot = path.dirname(repoRoot);

function requireFromRepo(rel) {
  return require(path.join(repoRoot, rel));
}

function config() {
  return {
    root: appRoot,
    allowWrite: true,
    allowSecrets: false,
    tools: { fsRead: true, fsWrite: true, fsBulk: true, fsList: true }
  };
}

function findChrome() {
  const candidates = [
    "C:/Program Files/Google/Chrome/Application/chrome.exe",
    "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
    path.join(os.homedir(), "AppData/Local/Google/Chrome/Application/chrome.exe"),
    "C:/Program Files/Microsoft/Edge/Application/msedge.exe",
    "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"
  ];
  return candidates.find(p => fs.existsSync(p)) || null;
}

async function simulate(html, entry = "index.html") {
  const { buildRuntimeActions } = requireFromRepo("apps/tunnel/agent/tools/fs/actionGroups/runtimeActions.js");
  return await buildRuntimeActions({
    payload: {
      action: "simulateRuntime",
      runtime: "browser",
      engine: "node-dom",
      entry,
      html
    },
    config: config()
  }).simulateRuntime();
}

async function runChromeDumpDom(html) {
  const chrome = findChrome();
  if (!chrome) return { skipped: true, reason: "chrome_executable_not_found" };
  const dir = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-dumpdom-"));
  const file = path.join(dir, "index.html");
  await fsp.writeFile(file, html, "utf8");
  try {
    const result = spawnSync(chrome, [
      "--headless=new",
      "--disable-gpu",
      "--no-first-run",
      "--no-default-browser-check",
      "--disable-background-networking",
      "--virtual-time-budget=1000",
      "--dump-dom",
      "file:///" + file.replace(/\\/g, "/")
    ], { encoding: "utf8", timeout: 12000, maxBuffer: 1024 * 1024 });
    return {
      ok: result.status === 0,
      status: result.status,
      signal: result.signal,
      stdout: result.stdout || "",
      stderr: result.stderr || "",
      chrome
    };
  } finally {
    await fsp.rm(dir, { recursive: true, force: true });
  }
}

async function assertMerkavaAndHeadlessChromeRenderSameBasicBody() {
  const html = `<body><main id="app">B\"H parity smoke</main><script>document.body.setAttribute("data-js", "ran")</script></body>`;
  const merkava = await simulate(html);
  assert.equal(merkava.ok, true);
  assert.equal(merkava.score, 100);
  assert.ok(
    merkava.domSnapshot.document.documentElement.textContent.includes(
      "B\"H parity smoke"
    )
  );

  const chrome = await runChromeDumpDom(html);
  if (chrome.skipped) return { chromeSkipped: chrome.reason };
  assert.equal(chrome.ok, true, chrome.stderr);
  assert.ok(chrome.stdout.includes("B\"H parity smoke"));
  assert.ok(chrome.stdout.includes("data-js=\"ran\"") || chrome.stdout.includes("data-js=ran"));
  return { chromeCompared: true, chrome: chrome.chrome };
}

async function assertDuplicateLexicalDeclarationIsNotFalseOk() {
  const html = `<body><script>let sameYear = 1; let sameYear = 2; console.log(sameYear)</script></body>`;
  const merkava = await simulate(html, "duplicate.html");
  assert.equal(merkava.ok, false);
  assert.equal(merkava.error, "runtime_preflight_failed");
  assert.ok(JSON.stringify(merkava.diagnostics).includes("sameYear"));
  assert.ok(JSON.stringify(merkava.diagnostics).includes("already been declared"));
}

async function assertRuntimeThrowIsNotFalseOk() {
  const html = `<body><script>console.log("before throw"); throw new Error("BH runtime explosion")</script></body>`;
  const merkava = await simulate(html, "throw.html");
  assert.equal(merkava.ok, false);
  assert.ok(merkava.score < 100);
  assert.ok(JSON.stringify(merkava.errors).includes("BH runtime explosion"));
  assert.ok(JSON.stringify(merkava.console).includes("before throw"));
}

(async () => {
  const results = {
    parity: await assertMerkavaAndHeadlessChromeRenderSameBasicBody(),
    duplicateLexical: "detected by Merkava preflight",
    runtimeThrow: "detected by Merkava runtime"
  };
  await assertDuplicateLexicalDeclarationIsNotFalseOk();
  await assertRuntimeThrowIsNotFalseOk();
  console.log(JSON.stringify({ ok: true, results }, null, 2));
})().catch(error => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
