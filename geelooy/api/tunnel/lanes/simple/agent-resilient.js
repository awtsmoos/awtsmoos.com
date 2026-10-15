#!/usr/bin/env node
// B"H — Simple tunnel agent: Resilient wrapper (Yaakov 2026-10-15)
// Auto-restarts the agent if it crashes. Runs forever.
// Usage: node agent-resilient.js [agent-js-file]
// Or: TUNNEL_AGENT_FILE=agent-poll.js node agent-resilient.js

const { spawn } = require("node:child_process");
const path = require("node:path");

const AGENT_FILE = process.env.TUNNEL_AGENT_FILE || process.argv[2] || path.join(__dirname, "agent-poll.js");
const RESTART_DELAY_MS = 5000;
let restartCount = 0;

console.log(`[resilient] Starting agent: ${AGENT_FILE}`);
console.log(`[resilient] Auto-restart enabled. Press Ctrl+C to stop.`);

function startAgent() {
  const child = spawn("node", [AGENT_FILE], {
    stdio: "inherit",
    env: process.env
  });

  child.on("exit", (code, signal) => {
    restartCount++;
    console.log(`[resilient] Agent exited (code=${code}, signal=${signal}). Restart #${restartCount} in ${RESTART_DELAY_MS}ms...`);
    setTimeout(startAgent, RESTART_DELAY_MS);
  });

  child.on("error", (err) => {
    console.log(`[resilient] Agent error: ${err.message}. Restarting...`);
    setTimeout(startAgent, RESTART_DELAY_MS);
  });
}

// Handle Ctrl+C gracefully
process.on("SIGINT", () => {
  console.log("\n[resilient] Shutting down...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("\n[resilient] Shutting down...");
  process.exit(0);
});

startAgent();
