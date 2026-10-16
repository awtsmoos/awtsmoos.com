#!/usr/bin/env node
// B"H
// Manual-approval lane: approval is an additional gate, never a replacement for
// the private device credential and server-side agent identity verification.
"use strict";
const https = require("node:https");
const fs = require("node:fs");
const os = require("node:os");
const agentId = String(process.env.TUNNEL_AGENT_ID || os.hostname());
const credentialFile = process.env.TUNNEL_AGENT_KEY_FILE ||
  (process.env.CREDENTIALS_DIRECTORY ? `${process.env.CREDENTIALS_DIRECTORY}/simple-agent.key` : "");
const key = process.env.TUNNEL_AGENT_KEY || process.env.TUNNEL_SECRET ||
  (credentialFile ? fs.readFileSync(credentialFile, "utf8").trim() : "");
const server = new URL(process.env.TUNNEL_SERVER || "https://awtsmoos.com");
if (server.protocol !== "https:" || !/^[A-Za-z0-9._-]{1,100}$/.test(agentId) || key.length < 32) {
  console.error("simple_tunnel_agent_credential_missing"); process.exit(2);
}
function api(route, data = null) {
  return new Promise((resolve, reject) => {
    const body = data ? JSON.stringify(data) : null;
    const request = https.request(new URL(route, server), {
      method: body ? "POST" : "GET", timeout: 10000,
      headers: { "x-awtsmoos-simple-agent-key": key,
        ...(body ? { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) } : {}) }
    }, response => {
      const parts = [];
      response.on("data", piece => parts.push(piece));
      response.on("end", () => {
        try { const result=JSON.parse(Buffer.concat(parts).toString());
          if (!result.ok || response.statusCode >= 400) reject(Error(result.error || "simple_tunnel_approval_denied"));
          else resolve(result);
        } catch (e) { reject(e); }
      });
    });
    request.on("error", reject);
    request.on("timeout", () => request.destroy(Error("simple_tunnel_approval_timeout")));
    if (body) request.write(body);
    request.end();
  });
}
(async () => {
  await api("/api/tunnel/control/simple/request", { agentId });
  console.log(`[simple-tunnel] authenticated approval pending for ${agentId}`);
  while (true) {
    const current = await api(`/api/tunnel/control/simple/approved?agentId=${encodeURIComponent(agentId)}`);
    if (current.approved) break;
    await new Promise(resolve => setTimeout(resolve, 3000));
  }
  console.log("[simple-tunnel] approved; starting authenticated polling agent");
  require("./agent-poll.js");
})().catch(error => { console.error(error.message); process.exitCode = 1; });
