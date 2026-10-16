#!/usr/bin/env node
// B"H
// Boruch Hashem
// Blessed is He
"use strict";

/**
 * Authenticated polling agent for environments where persistent WS is unavailable.
 * Executes only commands that the authenticated server has assigned to this agent.
 * POSTs output to the server: local-only queue writes were not result delivery.
 */
const https = require("node:https");
const { exec, execFile } = require("node:child_process");
const Policy = require("./agent-command-policy.js");
const os = require("node:os");
const fs = require("node:fs");

const server = new URL(process.env.TUNNEL_SERVER || "https://awtsmoos.com");
const agentId = String(process.env.TUNNEL_AGENT_ID || os.hostname()).slice(0, 100);
const key = String(process.env.TUNNEL_AGENT_KEY || process.env.TUNNEL_SECRET || "").trim() ||
  ((process.env.TUNNEL_AGENT_KEY_FILE || process.env.CREDENTIALS_DIRECTORY)
    ? fs.readFileSync(process.env.TUNNEL_AGENT_KEY_FILE || `${process.env.CREDENTIALS_DIRECTORY}/simple-agent.key`, "utf8").trim()
    : "");
const pollMs = Math.max(500, Number(process.env.TUNNEL_POLL_MS || 3000));
const policy = { timeout: 60000, maxBuffer: 128000 };

if (server.protocol !== "https:" || key.length < 32 || !/^[a-zA-Z0-9._-]{1,100}$/.test(agentId)) {
  console.error("simple_tunnel_https_or_agent_credential_missing");
  process.exit(2);
}

function api(endpoint, payload = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, server);
    const body = payload === null ? null : JSON.stringify(payload);
    const req = https.request(url, { method: body === null ? "GET" : "POST",
      timeout: 15000,
      headers: {
        "x-awtsmoos-simple-agent-key": key,
        "User-Agent": "awtsmoos-simple-agent/4.0",
        ...(body !== null ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } : {})
      }
    }, response => {
      const chunks = []; let bytes = 0;
      response.on("data", chunk => {
        bytes += chunk.length;
        if (bytes > 128000) { req.destroy(new Error("simple_tunnel_response_too_large")); return; }
        chunks.push(chunk);
      });
      response.on("end", () => {
        try {
          const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
          if (!parsed.ok || response.statusCode >= 400) reject(new Error(parsed.error || "simple_tunnel_http_failure"));
          else resolve(parsed);
        } catch (error) { reject(error); }
      });
    });
    req.on("timeout", () => req.destroy(new Error("simple_tunnel_timeout")));
    req.on("error", reject);
    if (body !== null) req.write(body);
    req.end();
  });
}

async function execute(item) {
  const result = await new Promise(resolve => {
    let executable;
    try {
      executable = process.env.TUNNEL_SIMPLE_COMMAND_PROFILE === "advanced"
        ? { program: item.command, args: [], nativeShell: true }
        : Policy.parse(item.command);
    } catch (error) {
      resolve({ id: item.id, agentId, output: "simple_tunnel_command_policy_denied",
        exitCode: 126 });
      return;
    }
    const done = (error, stdout, stderr) => resolve({
      id: item.id, agentId,
      output: ((stdout || "") + (stderr || "")).slice(0, 64000),
      exitCode: Number.isInteger(error?.code) ? error.code : error ? 1 : 0
    });
    if (executable.nativeShell) exec(executable.program, policy, done);
    else execFile(executable.program, executable.args, policy, done);
  });
  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      await api("/api/tunnel/control/simple/result", result);
      console.log(`[simple-tunnel] delivered result ${item.id}`);
      return;
    } catch (error) {
      if (attempt === 4) console.error(`[simple-tunnel] result delivery failed for ${item.id}: ${error.message}`);
      else await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
    }
  }
}

let stopped = false;
process.on("SIGTERM", () => { stopped = true; });
process.on("SIGINT", () => { stopped = true; });

(async () => {
  console.log(`[simple-tunnel] authenticated polling started for ${agentId}`);
  while (!stopped) {
    try {
      const job = await api(`/api/tunnel/control/simple/poll?agentId=${encodeURIComponent(agentId)}`);
      if (job.command && job.id) await execute(job);
    } catch (error) {
      if (!stopped) console.error(`[simple-tunnel] ${error.message}`);
    }
    if (!stopped) await new Promise(resolve => setTimeout(resolve, pollMs));
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
