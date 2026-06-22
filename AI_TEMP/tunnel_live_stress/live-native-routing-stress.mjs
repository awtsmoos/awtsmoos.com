import crypto from "node:crypto";

const tunnelName = process.env.AWTSMOOS_TUNNEL_NAME || "awt-awtsmoos-7320";
const origin = process.env.AWTSMOOS_ORIGIN || "https://awtsmoos.com";
const cookie = process.env.AWTSMOOS_COOKIE || "";
const bearer = process.env.AWTSMOOS_BEARER || "";
const root = "/Users/awtsmoos/Documents/awtsmoos/git/awtsmoos.com";
const total = Number(process.env.AWTSMOOS_LIVE_STRESS_TOTAL || 50);
const parallel = Number(process.env.AWTSMOOS_LIVE_STRESS_PARALLEL || 10);

function headers() {
  const h = { "content-type": "application/json" };
  if (cookie) h.cookie = cookie;
  if (bearer) h.authorization = `Bearer ${bearer}`;
  return h;
}

async function call(action, payload = {}) {
  const body = {
    action,
    targetVessel: "native-tunnel",
    tunnelName,
    requestedTunnelName: tunnelName,
    requestedAction: action,
    ...payload
  };

  const res = await fetch(`${origin}/api/tunnel/control/fs/${tunnelName}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body)
  });

  const text = await res.text();
  let json;
  try { json = JSON.parse(text); }
  catch { throw new Error(`non-json ${res.status}: ${text.slice(0, 500)}`); }

  return { status: res.status, json, body };
}

function assertEnvelope(action, nonce, got) {
  const j = got.json;
  const problems = [];

  if (j.tunnelName && j.tunnelName !== tunnelName) problems.push(`wrong tunnel ${j.tunnelName}`);
  if (j.vessel && j.vessel !== "native-tunnel") problems.push(`wrong vessel ${j.vessel}`);
  if (j.actualAction && j.actualAction !== action && !(action === "command" && j.actualAction === "commandRun")) problems.push(`wrong actualAction ${j.actualAction}`);
  if (j.requestAction && j.requestAction !== action) problems.push(`wrong requestAction ${j.requestAction}`);
  if (j.action && j.action !== action && !(action === "command" && j.action === "commandRun")) problems.push(`wrong action ${j.action}`);
  if (JSON.stringify(j).includes("awtsmoos-virtual-os")) problems.push("virtual-os leak");
  if (nonce && !JSON.stringify(j).includes(nonce)) problems.push(`nonce missing ${nonce}`);

  if (problems.length) {
    const e = new Error(`MISMATCH ${action} ${nonce}: ${problems.join("; ")}`);
    e.response = j;
    throw e;
  }
}

async function one(i) {
  const nonce = `BH_LIVE_NATIVE_${Date.now()}_${i}_${crypto.randomBytes(4).toString("hex")}`;
  const dir = `${root}/AI_TEMP/tunnel_live_stress/${nonce}`;
  const file = `${dir}/nonce.txt`;

  let r = await call("mkdirp", { p: dir, nonce });
  assertEnvelope("mkdirp", null, r);

  r = await call("write", { p: file, content: `B"H\n${nonce}\n`, nonce });
  assertEnvelope("write", null, r);

  r = await call("readBytes", { p: file, offsetBytes: 0, maxBytes: 2000, nonce });
  assertEnvelope("readBytes", nonce, r);

  r = await call("command", { cwd: root, command: `printf '${nonce}\\n'`, nonce });
  const jobId = r.json.jobId;
  assertEnvelope("command", null, r);
  if (!jobId) throw new Error(`missing jobId for ${nonce}`);

  for (let tries = 0; tries < 30; tries++) {
    const s = await call("commandStatus", { jobId, nonce });
    if (s.json.status === "completed" || s.json.done) break;
    await new Promise(res => setTimeout(res, 500));
  }

  r = await call("commandJobOutputPage", { jobId, stream: "stdout", offsetChars: 0, maxChars: 2000, nonce });
  assertEnvelope("commandJobOutputPage", nonce, r);

  return { ok: true, nonce, jobId };
}

const failures = [];
let done = 0;
for (let i = 0; i < total; i += parallel) {
  const batch = Array.from({ length: Math.min(parallel, total - i) }, (_, j) => one(i + j).catch(e => {
    failures.push({ message: e.message, response: e.response });
    return null;
  }));
  const out = await Promise.all(batch);
  done += out.filter(Boolean).length;
  console.log(JSON.stringify({ progress: done, failures: failures.length }));
}

console.log(JSON.stringify({ ok: failures.length === 0, total, passed: done, failures }, null, 2));
process.exit(failures.length ? 1 : 0);
