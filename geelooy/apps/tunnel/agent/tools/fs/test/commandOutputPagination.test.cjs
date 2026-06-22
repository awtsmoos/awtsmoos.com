// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildActions } = require("../actions.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-command-output-"));
fs.mkdirSync(path.join(root, ".git"));
const config = { root, allowCommands: true, allowWrite: true, allowSecrets: true, tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true } };

(async () => {
  const node = JSON.stringify(process.execPath);
  const payload = {
    action: "command",
    command: `${node} -e "process.stdout.write('A'.repeat(2500)); process.stderr.write('B'.repeat(1300))"`,
    cwd: ".",
    maxChars: 1000,
    maxBytes: 100000,
    allowCommands: true,
    inline: true
  };
  const actions = buildActions(config, payload, null);
  const got = await actions.command();
  assert.strictEqual(got.ok, true, got.error || got.stderr);
  assert.strictEqual(got.outputPaged, true);
  assert.strictEqual(got.stdout.length, 1000);
  assert.strictEqual(got.stderr.length, 1000);
  assert(got.nextStdoutPagePayload);
  assert(got.nextStderrPagePayload);
  assert(fs.existsSync(path.join(root, got.outputRef)));
  const page = await buildActions(config, got.nextStdoutPagePayload, null).commandOutputPage();
  assert.strictEqual(page.ok, true);
  assert.strictEqual(page.stream, "stdout");
  assert.strictEqual(page.offsetChars, 1000);
  assert.strictEqual(page.returnedChars, 1000);
  assert.strictEqual(page.hasNextPage, true);
  const stderr = await buildActions(config, got.nextStderrPagePayload, null).commandOutputPage();
  assert.strictEqual(stderr.stream, "stderr");
  assert.strictEqual(stderr.returnedChars, 300);
  assert.strictEqual(stderr.hasNextPage, false);
  const gitignore = fs.readFileSync(path.join(root, ".gitignore"), "utf8");
  assert(gitignore.includes(".awtsmoos/"));
  console.log("BHY command output pagination tests passed");
})().catch(error => { console.error(error); process.exit(1); });
