#!/usr/bin/env node
// B"H — Simple Tunnel Lane Installer (Yaakov 2026-10-15)
// Beautiful stylized CLI. Installs any simple tunnel lane.

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const C = {
  reset: "\x1b[0m", bold: "\x1b[1m", dim: "\x1b[2m",
  green: "\x1b[38;2;0;255;136m", cyan: "\x1b[38;2;0;238;255m",
  gold: "\x1b[38;2;255;204;0m", red: "\x1b[38;2;255;68;68m",
  purple: "\x1b[38;2;200;100;255m"
};

const LANES = {
  "poll": {
    file: "agent-poll.js",
    desc: "HTTP polling, no approval. For trusted environments.",
    cmd: "node agent-poll.js"
  },
  "approval": {
    file: "agent-approval.js",
    desc: "File-based approval. For semi-trusted environments.",
    cmd: "node agent-approval.js"
  },
  "websocket": {
    file: "agent-websocket.js",
    desc: "WebSocket real-time. Falls back to polling.",
    cmd: "node agent-websocket.js"
  },
  "file": {
    file: "agent-file.js",
    desc: "Pure file, zero HTTP. For air-gapped environments.",
    cmd: "node agent-file.js"
  }
};

function header(title) {
  console.log("");
  console.log(`${C.cyan}${C.bold}╔${"═".repeat(62)}╗${C.reset}`);
  console.log(`${C.cyan}${C.bold}║${C.reset}  ${C.gold}${C.bold}✦ ${title} ✦${C.reset}${" ".repeat(Math.max(0, 54 - title.length))}${C.cyan}${C.bold}║${C.reset}`);
  console.log(`${C.cyan}${C.bold}╚${"═".repeat(62)}╝${C.reset}`);
  console.log("");
}

function main() {
  const lane = process.argv[2] || "poll";
  const mode = process.argv[3] || "foreground"; // foreground | background

  header("SIMPLE TUNNEL INSTALLER");

  if (!LANES[lane]) {
    console.log(`  ${C.red}Unknown lane: ${lane}${C.reset}`);
    console.log("");
    console.log(`  ${C.bold}Available lanes:${C.reset}`);
    for (const [name, info] of Object.entries(LANES)) {
      console.log(`    ${C.cyan}${name}${C.reset} — ${C.dim}${info.desc}${C.reset}`);
    }
    console.log("");
    console.log(`  ${C.dim}Usage: node install-lane.js [poll|approval|websocket|file] [foreground|background]${C.reset}`);
    console.log("");
    process.exit(1);
  }

  const info = LANES[lane];
  console.log(`  ${C.green}${C.bold}✓${C.reset}  Installing lane: ${C.bold}${C.cyan}${lane}${C.reset}`);
  console.log(`  ${C.dim}     ${info.desc}${C.reset}`);
  console.log("");

  const agentPath = path.join(__dirname, info.file);
  if (!fs.existsSync(agentPath)) {
    console.log(`  ${C.red}Agent file not found: ${agentPath}${C.reset}`);
    process.exit(1);
  }

  if (mode === "background") {
    // B"H — Run in background, print PID, survive Ctrl+C
    const { spawn } = require("node:child_process");
    console.log(`  ${C.gold}▶${C.reset}  Starting agent in ${C.bold}background${C.reset}...`);
    const child = spawn(process.execPath, [agentPath], {
      detached: true,
      stdio: "ignore",
      env: process.env
    });
    child.unref();
    console.log(`  ${C.green}${C.bold}✓${C.reset}  Agent running in background (PID: ${C.bold}${child.pid}${C.reset})`);
    console.log(`  ${C.dim}     It will stay active even if you close this terminal.${C.reset}`);
    console.log(`  ${C.dim}     To stop: kill ${child.pid}${C.reset}`);
    console.log("");
  } else {
    // B"H — Run in foreground, Ctrl+C to stop
    console.log(`  ${C.gold}▶${C.reset}  Starting agent in ${C.bold}foreground${C.reset}...`);
    console.log(`  ${C.dim}     Command: ${info.cmd}${C.reset}`);
    console.log("");
    console.log(`  ${C.dim}  Press Ctrl+C to stop. The agent will poll for commands.${C.reset}`);
    console.log("");
    require(agentPath);
  }
}

main();
