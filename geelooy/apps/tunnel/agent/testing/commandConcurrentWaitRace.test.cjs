// B"H
process.env.AWTSMOOS_COMMAND_MAX_ACTIVE = "1";
const assert = require("assert");
const fsp = require("fs/promises");
const os = require("os");
const path = require("path");
const { startCommandJob, commandWait, commandJobOutputPage } = require("../tools/fs/commandJobStore.js");

/**
 * B"H
 * Chapter 515: Thirty-two sparks entered the command river together.
 * No status poll may overwrite the child process close event; every small
 * command must complete and stay complete under concurrent wait pressure.
 */
(async () => {
  const root = await fsp.mkdtemp(path.join(os.tmpdir(), "awtsmoos-cmd-race-"));
  const config = { root, allowCommands: true, tools: { command: true }, command: { enabled: true } };
  const count = 32;
  const commandFor = index => process.platform === "win32" ? `echo RACE_${index}` : `printf RACE_${index}`;
  const jobs = await Promise.all(Array.from({ length: count }, (_, index) => startCommandJob(config, { command: commandFor(index), cwd: ".", timeoutMs: 30000 }).then(job => ({ index, job }))));
  for (const item of jobs) {
    assert.equal(item.job.ok, true);
    assert.ok(item.job.jobId);
  }
  const waited = await Promise.all(jobs.map(({ index, job }) => commandWait(config, { id: job.jobId, waitTimeoutMs: 30000, pollIntervalMs: 25, maxChars: 2000 }).then(result => ({ index, job, result }))));
  for (const item of waited) {
    assert.equal(item.result.ok, true, JSON.stringify(item.result));
    assert.equal(item.result.status, "completed", JSON.stringify(item.result));
    const page = await commandJobOutputPage(config, { jobId: item.job.jobId, stream: "stdout", maxChars: 2000 });
    assert.match(page.content, new RegExp(`RACE_${item.index}`));
  }
  console.log(JSON.stringify({ ok: true, checks: ["parallel-start", "parallel-wait", "no-running-resurrection"], count }, null, 2));
})().catch(error => { console.error(error); process.exit(1); });
