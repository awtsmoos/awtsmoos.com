//B"H
const http = require("http");
const { assert, test } = require("./assert.cjs");
const { startServer } = require("../../relay/split-browser/server.cjs");

/**
 * B"H — Auth stress harness for the Node relay.
 * It proves cold health/control/session safety, no-token to token transition,
 * redaction, cursor resume, and failed-auth automation stop behavior.
 */
async function run() {
  const results = [];
  results.push(await sessionTransitionTest());
  results.push(await failedAuthAutomationTest());
  return {
    ok: results.every(item => item.ok),
    name: "node-relay-auth-session-stress",
    ms: results.reduce((sum, item) => sum + item.ms, 0),
    facts: Object.fromEntries(results.map(item => [item.name, item.facts]))
  };
}

function sessionTransitionTest() {
  return test("relay-auth-cold-health-control-session-transition", async () => {
    let upstream;
    let relay;
    const secret = "raw-token-never-print-1234567890";
    const seenAuth = [];
    const state = { token:false };
    try {
      upstream = http.createServer((req, res) => {
        const url = new URL(req.url, "http://mock.chatgpt");
        if (url.pathname === "/api/auth/session") return json(res, state.token ? { accessToken:secret, user:{ id:"u1", email:"x@example.test" } } : { user:null });
        if (url.pathname === "/backend-api/conversation/auth-check") {
          seenAuth.push(String(req.headers.authorization || ""));
          return json(res, makeConversation());
        }
        return json(res, { ok:true });
      });
      await listen(upstream, 39931);
      relay = startServer({ port:39932, host:"127.0.0.1", targetOrigin:"http://127.0.0.1:39931", allowedOrigins:["http://127.0.0.1:39931"], verbose:false });
      await onceListening(relay);
      const base = "http://127.0.0.1:39932";
      const health = await getJson(base + "/health");
      const control = await (await fetch(base + "/control")).text();
      const cold = await getJson(base + "/session-status");
      state.token = true;
      const warm = await getJson(base + "/session-status");
      const auto = await postJson(base + "/automation-start", { conversationId:"auth-check", settings:{ maxTurns:1, delayMs:10, prompt:"auth" } });
      await sleep(120);
      const final = await getJson(base + "/automation-status?conversationId=auth-check");
      const events0 = await getJson(base + "/automation-events?conversationId=auth-check&after=0");
      const eventsResume = await getJson(base + `/automation-events?conversationId=auth-check&after=${Math.max(0, events0.cursor - 1)}`);
      const serialized = JSON.stringify({ health, cold, warm, auto, final, events0, eventsResume, control });
      assert(health.ok && health.session.status === "not_logged_in", "cold relay health must be OK and session safe", health);
      assert(/status-badge|session-status|Check session/i.test(control), "control page must expose compact status UI", control.slice(0, 300));
      assert(cold.ok && cold.status === "not_logged_in" && !cold.auth.hasToken, "session endpoint reports not logged in without crashing", cold);
      assert(warm.ok && warm.status === "logged_in" && warm.auth.hasToken && warm.auth.tokenSummary.redacted !== secret, "session endpoint returns only redacted token summary", warm);
      assert(seenAuth.some(value => value === `Bearer ${secret}`), "backend request must receive bearer token", seenAuth);
      assert(!serialized.includes(secret), "raw token must never appear in relay UI/status/event JSON");
      assert(events0.events.length >= 2 && eventsResume.events.length >= 1, "automation-events must support cursor resume", { cursor:events0.cursor, resumed:eventsResume.events.length });
      return { cold:cold.status, warm:warm.status, cursor:events0.cursor, resumed:eventsResume.events.length, final:final.status };
    } finally {
      try { relay?.close(); } catch {}
      try { upstream?.close(); } catch {}
    }
  });
}

function failedAuthAutomationTest() {
  return test("relay-auth-failure-stops-no-fake-commit", async () => {
    let upstream;
    let relay;
    try {
      upstream = http.createServer((req, res) => {
        const url = new URL(req.url, "http://mock.chatgpt");
        if (url.pathname === "/api/auth/session") return json(res, { user:null });
        return json(res, { error:"must_not_reach_backend" }, 500);
      });
      await listen(upstream, 39933);
      relay = startServer({ port:39934, host:"127.0.0.1", targetOrigin:"http://127.0.0.1:39933", allowedOrigins:["http://127.0.0.1:39933"], verbose:false });
      await onceListening(relay);
      const base = "http://127.0.0.1:39934";
      await postJson(base + "/automation-start", { conversationId:"missing-token", settings:{ maxTurns:2, delayMs:10, prompt:"auth fail" } });
      let final = null;
      for (let i = 0; i < 30; i++) {
        final = await getJson(base + "/automation-status?conversationId=missing-token");
        if (final.status === "error") break;
        await sleep(30);
      }
      const events = await getJson(base + "/automation-events?conversationId=missing-token&after=0");
      assert(final.ok === false && final.status === "error" && final.turns === 0, "failed auth stops automation without committed turns", final);
      assert(final.error === "token_absent" && /access token|login/i.test(final.safeHint), "failed auth exposes structured safe status", final);
      assert(!events.events.some(event => event.type === "verified"), "missing token must not fake a verified turn", events);
      return { status:final.status, turns:final.turns, error:final.error, events:events.events.length };
    } finally {
      try { relay?.close(); } catch {}
      try { upstream?.close(); } catch {}
    }
  });
}

function makeConversation() {
  return { id:"auth-check", current_node:"assistant-0", mapping:{ "assistant-0":{ id:"assistant-0", parent:null, message:{ id:"assistant-0", author:{ role:"assistant" }, status:"finished_successfully", content:{ content_type:"text", parts:["ready"] } } } } };
}
function json(res, value, status = 200) { res.writeHead(status, { "content-type":"application/json" }); res.end(JSON.stringify(value)); }
async function getJson(url) { return await (await fetch(url, { cache:"no-store" })).json(); }
async function postJson(url, body) { return await (await fetch(url, { method:"POST", headers:{ "content-type":"application/json" }, body:JSON.stringify(body) })).json(); }
function listen(server, port) { return new Promise(resolve => server.listen(port, "127.0.0.1", resolve)); }
function onceListening(server) { return server.listening ? Promise.resolve() : new Promise(resolve => server.on("listening", resolve)); }
function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
module.exports = { run };
