// B"H
const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { buildActions } = require("../actions.js");

const root = fs.mkdtempSync(path.join(os.tmpdir(), "awt-command-job-"));
fs.mkdirSync(path.join(root, ".git"));
const config = { root, allowCommands: true, allowWrite: true, allowSecrets: true, tools: { command: true, fsRead: true, fsWrite: true, fsBulk: true } };
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

(async () => {
  const node = JSON.stringify(process.execPath);
  const start = await buildActions(config, { action: "commandStart", command: `${node} -e "console.log('line-4'); setTimeout(()=>process.exit(0), 250)"`, cwd: ".", allowCommands: true, timeoutMs: 10000 }, null).commandStart();
  assert.strictEqual(start.ok, true);
  assert(start.jobId);
  let page = null;
  let status = null;
  for (let i = 0; i < 80; i++) {
    status = await buildActions(config, { action: "commandStatus", jobId: start.jobId }, null).commandStatus();
    page = await buildActions(config, { action: "commandJobOutputPage", jobId: start.jobId, stream: "stdout", maxChars: 1000 }, null).commandJobOutputPage();
    if (page.content.includes("line-4")) break;
    await sleep(125);
  }
  assert.strictEqual(status.ok, true);
  assert.strictEqual(page.ok, true);
  assert(page.content.includes("line-4"));
  if (status.status === "running") {
    const cancelled = await buildActions(config, { action: "commandCancel", jobId: start.jobId }, null).commandCancel();
    assert.strictEqual(cancelled.ok, true);
  }
  console.log("BHY command async job tests passed");
})().catch(error => { console.error(error); process.exit(1); });
