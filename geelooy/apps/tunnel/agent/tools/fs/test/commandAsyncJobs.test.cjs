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
  const start = await buildActions(config, { action: "commandStart", command: `${node} -e "let i=0; const t=setInterval(()=>{ console.log('line-'+(++i)); if(i===4){clearInterval(t)} }, 80);"`, cwd: ".", allowCommands: true, timeoutMs: 3000 }, null).commandStart();
  assert.strictEqual(start.ok, true);
  assert(start.jobId);
  let status = null;
  for (let i = 0; i < 30; i++) {
    status = await buildActions(config, { action: "commandStatus", jobId: start.jobId }, null).commandStatus();
    if (status.status === "completed") break;
    await sleep(100);
  }
  assert.strictEqual(status.ok, true);
  assert.strictEqual(status.status, "completed");
  const page = await buildActions(config, { action: "commandJobOutputPage", jobId: start.jobId, stream: "stdout", maxChars: 1000 }, null).commandJobOutputPage();
  assert.strictEqual(page.ok, true);
  assert(page.content.includes("line-4"));
  console.log("BHY command async job tests passed");
})().catch(error => { console.error(error); process.exit(1); });
