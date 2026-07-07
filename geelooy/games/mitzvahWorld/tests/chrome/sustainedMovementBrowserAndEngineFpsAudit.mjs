// B"H
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
const proof = JSON.parse(readFileSync("ai_thoughts/20260707-004045-full-repair-no-freeze-loading-ui-targeting-doors/proof/twoMinuteNoFreezeAudit.json", "utf8"));
assert(proof.ok, "two-minute browser proof must pass");
const s = proof.sample;
assert(s.frameCount > 300, "browser rAF frame count must prove sustained movement");
assert(s.durationMs >= 120000, "proof must run for 120 seconds");
assert(s.avgBrowserRafFps > 30, "average browser rAF FPS must stay playable");
assert(s.engineFps > 30, "engine FPS must stay playable");
assert.equal(proof.fatalConsoleOrNetwork, 0, "no fatal console/network failures");
for (const key of ["health", "targeting", "x", "r", "quest", "joystick", "jump"]) assert.equal(s.hud[key], true, `HUD missing ${key}`);
console.log(JSON.stringify({ ok:true, test:"sustainedMovementBrowserAndEngineFpsAudit", avgBrowserRafFps:s.avgBrowserRafFps, minBrowserRafFps:s.minBrowserRafFps, engineFps:s.engineFps, p95FrameMs:s.p95FrameMs, p99FrameMs:s.p99FrameMs, worstFrameMs:s.worstFrameMs, longTaskCount:s.longTaskCount }, null, 2));
