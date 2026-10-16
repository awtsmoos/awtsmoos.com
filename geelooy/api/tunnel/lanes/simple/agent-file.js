// B"H — Simple tunnel lane: Pure file (Yaakov 2026-10-15)
// 100% file-based. No HTTP. Agent watches a command file, executes,
// writes results to a result file. For air-gapped or HTTP-blocked envs.
//
// Usage:
//   1. Write commands to /tmp/simple-tunnel-commands/<agentId>.json
//      Format: {"id": "cmd1", "command": "echo hi"}
//   2. Agent watches the file, executes, writes to /tmp/simple-tunnel-results/<agentId>/<id>.json
//   3. Read result files directly.
//
// This lane has zero network dependency.

const fs = require("node:fs");
const path = require("node:path");
const { execFile } = require("node:child_process");
const Policy = require("./agent-command-policy.js");

const AGENT_ID = process.env.TUNNEL_AGENT_ID || require("node:os").hostname();
if (!/^[A-Za-z0-9._-]{1,100}$/.test(AGENT_ID)) throw Error("invalid_agent_identity");
const CMD_DIR = process.env.TUNNEL_CMD_DIR || "/tmp/simple-tunnel-commands";
const RESULT_DIR = process.env.TUNNEL_RESULT_DIR || "/tmp/simple-tunnel-results";
const POLL_MS = 2000;

const myCmdFile = path.join(CMD_DIR, `${AGENT_ID}.json`);
const myResultDir = path.join(RESULT_DIR, AGENT_ID);

function ensureDirs() {
  try {
    fs.mkdirSync(CMD_DIR, { recursive: true, mode: 0o700 });
    fs.mkdirSync(myResultDir, { recursive: true, mode: 0o700 });
  } catch {}
}

function checkForCommands() {
  try {
    if (!fs.existsSync(myCmdFile)) return;
    const data = fs.readFileSync(myCmdFile, "utf8");
    const cmds = JSON.parse(data);
    const list = Array.isArray(cmds) ? cmds : [cmds];
    // Clear the file so we don't re-run
    fs.writeFileSync(myCmdFile, "[]", { mode: 0o600 });
    for (const cmd of list) {
      if (!cmd || !/^[A-Za-z0-9_-]{1,100}$/.test(String(cmd.id || "")) || !cmd.command) continue;
      let action;
      try { action = Policy.parse(cmd.command); }
      catch { console.error("[tunnel] rejected file-lane command by safe policy"); continue; }
      execFile(action.program, action.args, { timeout: 30000, maxBuffer: 64000 }, (err, stdout, stderr) => {
        const output = (stdout || "") + (stderr || "");
        const resultFile = path.join(myResultDir, `${cmd.id}.json`);
        try {
          fs.writeFileSync(resultFile, JSON.stringify({
            id: cmd.id,
            output: output.slice(0, 50000),
            completedAt: new Date().toISOString()
          }), { mode: 0o600 });
          console.log(`[tunnel] Result written: ${resultFile}`);
        } catch (e) {
          console.log(`[tunnel] Write failed: ${e.message}`);
        }
      });
    }
  } catch (e) {
    // Ignore parse errors, retry next poll
  }
}

console.log(`[tunnel] Pure file lane starting for agent: ${AGENT_ID}`);
console.log(`[tunnel] Watching: ${myCmdFile}`);
console.log(`[tunnel] Results: ${myResultDir}/`);
ensureDirs();
setInterval(checkForCommands, POLL_MS);
checkForCommands();
