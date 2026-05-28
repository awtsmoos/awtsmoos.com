//B"H
const http = require("http");
const { assert, test } = require("./assert.cjs");
const { startServer } = require("../../relay/split-browser/server.cjs");

/**
 * B"H — Spins up local upstreams and the split-browser relay.
 * It verifies normal relay streams and independently tests Node-relay-owned
 * automation with staged polling while the run is still progressing.
 */
async function run() {
  const results = [];
  results.push(await relayStreamsTest());
  results.push(await relayAutomationTest());
  return {
    ok: results.every(item => item.ok),
    name: "node-relay-multi-streams-and-automation",
    ms: results.reduce((sum, item) => sum + item.ms, 0),
    facts: Object.fromEntries(results.map(item => [item.name, item.facts]))
  };
}

function relayStreamsTest() {
  return test("node-relay-multi-streams-and-bodies", async () => {
    let upstream;
    let relay;
    try {
      upstream = http.createServer((req, res) => {
        if (req.url === "/redirect") { res.writeHead(302, { location: "/next" }); return res.end(); }
        const url = new URL(req.url, "http://x");
        const chunks = [];
        req.on("data", c => chunks.push(c));
        req.on("end", () => {
          if (url.pathname === "/stream") {
            res.writeHead(200, { "content-type": "text/plain" });
            return res.end(`${url.searchParams.get("id")}-0;${url.searchParams.get("id")}-1;${url.searchParams.get("id")}-2;`);
          }
          res.writeHead(200, { "content-type": "application/json" });
          res.end(JSON.stringify({ method: req.method, url: req.url, body: Buffer.concat(chunks).toString("utf8") }));
        });
      });
      await listen(upstream, 39821);
      const origin = "http://127.0.0.1:39821";
      relay = startServer({ port: 39822, host: "127.0.0.1", targetOrigin: origin, allowedOrigins: [origin], verbose: false });
      await new Promise(resolve => relay.on("listening", resolve));
      const base = "http://127.0.0.1:39822";
      const post = await (await fetch(base + "/echo", { method: "POST", headers: { "content-type": "text/plain" }, body: "hello" })).json();
      assert(post.method === "POST" && post.body === "hello", "proxy POST body must survive", post);
      const redirect = await fetch(base + "/redirect", { redirect: "manual" });
      assert(redirect.status === 302 && (redirect.headers.get("location") || "").includes("/next"), "redirect must map locally");
      const starts = [];
      for (let i = 0; i < 5; i++) starts.push(await (await fetch(base + "/fetch", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ url:`${origin}/stream?id=${i}`, options:{ method:"GET" } }) })).json());
      const texts = [];
      for (const meta of starts) texts.push((await (await fetch(base + "/body", { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify({ id:meta.id, bodyAction:"text" }) })).json()).result);
      assert(new Set(starts.map(s => s.id)).size === starts.length, "relay stream ids must be unique");
      assert(texts.every((text, i) => text === `${i}-0;${i}-1;${i}-2;`), "all relay streams must complete", { texts });
      return { post:true, redirect:true, streams:starts.length };
    } finally {
      try { relay?.close(); } catch {}
      try { upstream?.close(); } catch {}
    }
  });
}

function relayAutomationTest() {
  return test("node-relay-background-automation-staged-real-streams", async () => {
    let upstream;
    let relay;
    const conversationId = "conv-relay-auto";
    const sends = [];
    const state = makeConversation(conversationId);
    try {
      upstream = http.createServer((req, res) => handleMockChatGpt(req, res, { state, sends }));
      await listen(upstream, 39823);
      const origin = "http://127.0.0.1:39823";
      relay = startServer({ port: 39824, host: "127.0.0.1", targetOrigin: origin, allowedOrigins: [origin], verbose: false });
      await new Promise(resolve => relay.on("listening", resolve));
      const base = "http://127.0.0.1:39824";
      const started = await relayJson(base, "/automation-start", { conversationId, settings:{ enabled:true, maxTurns:5, delayMs:25, prompt:"continue {{turn}}", stopOnError:true } });
      assert(started.owner === "node-relay" && started.status === "armed", "relay automation must start as node-relay owner", started);
      const progress = [];
      let cursor = 0;
      let final = started;
      for (let i = 0; i < 140; i++) {
        const eventPack = await relayEvents(base, conversationId, cursor);
        cursor = eventPack.cursor;
        if (eventPack.events.length) progress.push(...eventPack.events.map(event => `${event.type}:${event.detail?.status || event.detail?.turn || event.detail?.assistantMessageId || ""}`));
        final = await relayStatus(base, conversationId);
        if (final.status === "done:max-turns" || final.status === "error") break;
        await sleep(35);
      }
      assert(final.status === "done:max-turns" && final.turns === 5, "relay automation must send at least 5 verified turns", { final, progress, sends });
      assert(sends.length === 5, "mock backend must receive exactly 5 real automation POSTs", { sends, progress });
      assert(sends.every((send, index) => send.parent === `assistant-${index}`), "each relay turn must use latest assistant as parent for five turns", sends);
      assert(progress.some(x => x.startsWith("send:")) && progress.some(x => x.startsWith("stream:")) && progress.some(x => x.startsWith("verified:")), "relay automation events must be pollable in stages", progress);
      return { sends:sends.length, turns:final.turns, status:final.status, stagedEvents:progress.length, parents:sends.map(s => s.parent) };
    } finally {
      try { relay?.close(); } catch {}
      try { upstream?.close(); } catch {}
    }
  });
}

function handleMockChatGpt(req, res, { state, sends }) {
  const url = new URL(req.url, "http://mock.chatgpt");
  if (url.pathname === "/api/auth/session") return json(res, { accessToken:"mock-token" });
  if (url.pathname === `/backend-api/conversation/${state.id}` && req.method === "GET") return json(res, conversationPayload(state));
  if (url.pathname === "/backend-api/conversation" && req.method === "POST") {
    return collectJson(req).then(body => {
      const user = body.messages?.[0] || {};
      const turn = sends.length + 1;
      const assistantId = `assistant-${turn}`;
      const userId = user.id || `user-${turn}`;
      sends.push({ turn, prompt:user.content?.parts?.[0] || "", parent:body.parent_message_id, userId });
      state.mapping[userId] = { id:userId, parent:body.parent_message_id, message:{ id:userId, author:{ role:"user" }, content:user.content || { content_type:"text", parts:[""] }, status:"finished_successfully", metadata:{} } };
      state.mapping[assistantId] = { id:assistantId, parent:userId, message:{ id:assistantId, author:{ role:"assistant" }, content:{ content_type:"text", parts:[`relay reply ${turn}`] }, status:"finished_successfully", metadata:{} } };
      state.current_node = assistantId;
      res.writeHead(200, { "content-type":"text/event-stream" });
      res.write(`data: ${JSON.stringify({ conversation_id:state.id, message:state.mapping[assistantId].message })}\n\n`);
      setTimeout(() => res.end("data: [DONE]\n\n"), 5);
    }).catch(error => json(res, { error:error.stack || String(error) }, 500));
  }
  json(res, { error:"not_found", path:url.pathname }, 404);
}

function makeConversation(id) {
  return {
    id,
    current_node:"assistant-0",
    mapping:{
      "root":{ id:"root", parent:null, message:null },
      "assistant-0":{ id:"assistant-0", parent:"root", message:{ id:"assistant-0", author:{ role:"assistant" }, content:{ content_type:"text", parts:["ready"] }, status:"finished_successfully", metadata:{} } }
    }
  };
}
function conversationPayload(state) { return { id:state.id, conversation_id:state.id, current_node:state.current_node, mapping:state.mapping }; }
async function relayJson(base, path, payload) { return await (await fetch(base + path, { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify(payload) })).json(); }
async function relayStatus(base, conversationId) { return await (await fetch(`${base}/automation-status?conversationId=${conversationId}`)).json(); }
async function relayEvents(base, conversationId, after) { return await (await fetch(`${base}/automation-events?conversationId=${conversationId}&after=${after}`)).json(); }
function collectJson(req) { return new Promise((resolve, reject) => { const chunks=[]; req.on("data", c => chunks.push(c)); req.on("end", () => { try { resolve(JSON.parse(Buffer.concat(chunks).toString("utf8") || "{}")); } catch(e) { reject(e); } }); }); }
function json(res, value, status = 200) { res.writeHead(status, { "content-type":"application/json" }); res.end(JSON.stringify(value)); }
function listen(server, port) { return new Promise(resolve => server.listen(port, "127.0.0.1", resolve)); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
module.exports = { run };
