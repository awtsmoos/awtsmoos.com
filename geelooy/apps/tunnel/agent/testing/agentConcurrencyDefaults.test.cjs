// B"H
const assert = require("assert");
const fs = require("fs");
const path = require("path");

const main = fs.readFileSync(path.resolve(__dirname, "../main.js"), "utf8");

assert(main.includes('const STRICT_ORDERING = process.env.AWTSMOOS_STRICT_ORDERING === "1";'), "strict ordering must be opt-in");
assert(main.includes("Math.min(64, Math.max(16, CPU_COUNT * 4))"), "default inflight must scale above one");
assert(main.includes("boundedNumber(process.env.AWTSMOOS_MAX_INFLIGHT, DEFAULT_MAX_INFLIGHT, 1, 128)"), "env inflight cap must allow stress");
assert(main.includes("boundedNumber(process.env.AWTSMOOS_MAX_QUEUE, 5000, 0, 50000)"), "queue default/cap must allow bursts");
assert(main.includes("controlRequestId"), "correlation must stay attached while concurrency rises");
assert(main.includes("nonce"), "nonce correlation must stay attached while concurrency rises");

console.log(JSON.stringify({ ok: true, suite: "agent-concurrency-defaults" }, null, 2));
