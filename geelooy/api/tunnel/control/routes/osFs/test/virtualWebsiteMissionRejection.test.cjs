// B"H
const assert = require("node:assert/strict");
const test = require("node:test");

const { dispatchOsFs } = require("../index.js");
const { supportAction } = require("../supportActions.js");
const {
  WEBSITE_MISSION_ACTIONS,
  isVirtualWebsiteMissionAction,
  rejectVirtualWebsiteMission
} = require("../virtualAiAgents.js");

test("Virtual OS rejects every native website-mission action explicitly", async () => {
  for (const action of WEBSITE_MISSION_ACTIONS) {
    assert.equal(isVirtualWebsiteMissionAction(action), true);
    const result = await dispatchOsFs({}, "test-user", {
      action,
      prompt: "harmless routing proof"
    });
    assert.equal(result.ok, false, action);
    assert.equal(result.status, 409, action);
    assert.equal(result.error, "website_mission_requires_live_browser", action);
    assert.equal(result.vessel, "virtual-os", action);
    assert.equal(result.fullyExecutable, false, action);
  }
});

test("support fallback cannot reinterpret a website mission as success", async () => {
  const result = await supportAction(
    "agent",
    { action: "agent", mode: "website-mission" },
    async () => ({ ok: true })
  );
  assert.deepEqual(result, rejectVirtualWebsiteMission("agent", {
    action: "agent",
    mode: "website-mission"
  }));
  assert.equal(result.retryableHere, false);
  assert.match(result.note, /cannot operate.*authenticated ChatGPT/i);
});
