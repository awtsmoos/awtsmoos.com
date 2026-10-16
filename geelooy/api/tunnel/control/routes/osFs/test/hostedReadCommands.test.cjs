// B"H
const assert = require("node:assert/strict");
const test = require("node:test");
const { runHostedReadCommand, tokenize, workspacePath } = require("../hostedReadCommands.js");

function virtualDispatcher(next) {
  if (next.action === "list") return Promise.resolve({ ok: true, items: ["one.txt", "two.txt", "sub/"] });
  if (next.action === "tree") return Promise.resolve({ ok: true, treeText: "one.txt\ntwo.txt\nsub/\n" });
  if (next.action === "read") {
    return Promise.resolve({ ok: true, content: "first line\nsecond line\nThird line\n", truncated: false });
  }
  throw Error("unexpected_virtual_action");
}

test("real structured commands run against the VFS without a shell", async () => {
  const pwd = await runHostedReadCommand({ program: "pwd", args: [], cwd: "asdf/projects" }, virtualDispatcher);
  assert.equal(pwd.ok, true);
  assert.equal(pwd.stdout, "asdf/projects\n");
  assert.equal(pwd.simulated, false);
  assert.equal(pwd.nativeShell, false);
  const ls = await runHostedReadCommand({ command: "ls 'asdf/projects'" }, virtualDispatcher);
  assert.equal(ls.stdout, "one.txt\ntwo.txt\nsub/\n");
  const cat = await runHostedReadCommand({ program: "cat", args: ["notes.txt"], cwd: "asdf/projects" }, virtualDispatcher);
  assert.equal(cat.ok, true);
  assert.match(cat.stdout, /second line/);
  const grep = await runHostedReadCommand({ program: "grep", args: ["-n", "second", "notes.txt"], cwd: "asdf/projects" }, virtualDispatcher);
  assert.equal(grep.stdout, "2:second line\n");
});

test("legacy parser rejects command chaining, expansion, redirects, and traversal", async () => {
  for (const command of ["ls && cat secret", "ls | head", "ls; whoami", "echo $(id)", "cat /etc/shadow", "cat ../secret", "git status", "npm test", "sudo ls"]) {
    const result = await runHostedReadCommand({ command }, virtualDispatcher);
    assert.equal(result.ok, false, command);
    assert.equal(result.stdout, "", command);
    assert.notEqual(result.exitCode, 0, command);
  }
  assert.throws(() => workspacePath("asdf", "..%2fsecret"), /virtual_os_path_escape_blocked|virtual_os_nested_segment_blocked/);
  assert.deepEqual(tokenize('cat "file with spaces.txt"'), ["cat", "file with spaces.txt"]);
});

test("command profile is restricted and failures remain failures", async () => {
  const rejected = await runHostedReadCommand({ program: "ls", profile: "administrator" }, virtualDispatcher);
  assert.equal(rejected.error, "VIRTUAL_COMMAND_PROFILE_DENIED");
  const failed = await runHostedReadCommand({ program: "cat", args: ["private.txt"] }, async () => ({ ok: false, error: "alias_not_owned" }));
  assert.equal(failed.error, "VIRTUAL_COMMAND_PATH_DENIED");
});

test("output is bounded and unavailable commands cannot execute host processes", async () => {
  const huge = await runHostedReadCommand({ program: "cat", args: ["big.txt"] }, async () => ({ ok: true, content: "x".repeat(100_000), truncated: false }));
  assert.equal(huge.stdout.length, 64_000);
  assert.equal(huge.truncated, true);
  const denied = await runHostedReadCommand({ program: "node", args: ["-e", "process.exit()"] }, virtualDispatcher);
  assert.equal(denied.error, "VIRTUAL_COMMAND_POLICY_DENIED");
});

test("real hosted dispatcher runs a VFS command through its normal action surface", async () => {
  const { dispatchOsFs } = require("../index.js");
  const result = await dispatchOsFs({}, "user-fixture", { action: "commandRun", program: "pwd", args: [], cwd: "asdf/projects" });
  assert.equal(result.ok, true);
  assert.equal(result.stdout, "asdf/projects\n");
});
