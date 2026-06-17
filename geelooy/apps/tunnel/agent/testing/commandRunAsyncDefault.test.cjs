// B"H
const assert = require("assert");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { runCommand } = require("../tools/command/run.js");

/**
 * B"H
 * Chapter 491: A command no longer blocks the gateway unless it swears it is
 * tiny. The default road returns a resumable job, preventing ClientResponseError
 * and tunnel relay timeout storms from broad repo commands.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-cmd-async-"));
  const config = { root, allowCommands: true, tools: { command: true }, command: { enabled: true, defaultShell: process.platform === "win32" ? "cmd" : "sh", timeoutMs: 5000, maxOutput: 12000 } };
  const asyncResult = await runCommand(config, { command: process.platform === "win32" ? "echo async" : "echo async" });
  assert.equal(asyncResult.ok, true);
  assert.equal(asyncResult.action, "commandRun");
  assert.equal(asyncResult.mode, "async_job");
  assert.ok(asyncResult.jobId);
  const inline = await runCommand(config, { command: process.platform === "win32" ? "echo inline" : "echo inline", sync: true, timeoutMs: 5000 });
  assert.equal(inline.action, "commandRun");
  assert.match(inline.stdout, /inline/);
  console.log(JSON.stringify({ ok: true, checks: ["async-default", "sync-opt-in"] }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
