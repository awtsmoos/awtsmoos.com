// B"H
const assert = require("assert");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { startCommandJob, commandStatus, commandWait, commandJobOutputPage } = require("../tools/fs/commandJobStore.js");

/**
 * B"H
 * Chapter 512 repaired: the job id crossed the river under many names, but the
 * witness may not wear yesterday's mask. commandStatus must say commandStatus,
 * not commandStart from stale metadata; commandWait must say commandWait; pages
 * must say commandJobOutputPage. The Awtsmoos breathes through names that match.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-job-life-"));
  const config = { root, allowCommands: true, tools: { command: true }, command: { enabled: true } };
  const command = process.platform === "win32" ? "echo lifecycle" : "printf lifecycle";
  const started = await startCommandJob(config, { command, cwd: ".", timeoutMs: 10000 });
  assert.equal(started.ok, true);
  assert.equal(started.action, "commandStart");
  assert.ok(started.jobId);

  const waited = await commandWait(config, { id: started.jobId, waitTimeoutMs: 10000, pollIntervalMs: 100, maxChars: 2000 });
  assert.equal(waited.ok, true);
  assert.equal(waited.action, "commandWait");
  assert.equal(waited.status, "completed");
  assert.match(waited.stdout.content, /lifecycle/);
  assert.equal(waited.stdout.hasNextPage, false);

  const status = await commandStatus(config, { jobId: started.jobId });
  assert.equal(status.ok, true);
  assert.equal(status.action, "commandStatus");
  assert.equal(status.running, false);

  const page = await commandJobOutputPage(config, { id: started.jobId, stream: "stdout", maxChars: 2000 });
  assert.equal(page.ok, true);
  assert.equal(page.action, "commandJobOutputPage");
  assert.match(page.content, /lifecycle/);
  console.log(JSON.stringify({ ok: true, checks: ["start", "wait-id-alias", "status-jobId", "output-id-alias", "actions-not-stale"] }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
