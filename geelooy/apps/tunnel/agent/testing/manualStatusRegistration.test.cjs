// B"H
const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const Reads = require("../recovery/manualReadCommands.js");
const dir = fs.mkdtempSync(path.join(os.tmpdir(), "awts-status-test-"));
const now = Date.now();
const processes = { ok: true, childPid: 1234 };
try {
  const receipt = (overrides = {}) => fs.writeFileSync(path.join(dir, "connection-state.json"),
    JSON.stringify({state: "registered", ownerPid: 1234, lastServerMessageAt: new Date(now-1000).toISOString(), ...overrides}));
  assert.equal(Reads.registrationStatus(dir, processes, now).ok, false);
  receipt();
  assert.equal(Reads.registrationStatus(dir, processes, now).ok, true);
  assert.equal(Reads.registrationStatus(dir, {...processes, ok: false}, now).reason, "registration_owner_not_running");
  receipt({ownerPid: 999});
  assert.equal(Reads.registrationStatus(dir, processes, now).reason, "registration_owner_not_running");
  receipt({lastServerMessageAt: new Date(now-45000).toISOString()});
  assert.equal(Reads.registrationStatus(dir, processes, now).reason, "registration_receipt_stale");
  receipt({state:"connecting"});
  assert.equal(Reads.registrationStatus(dir, processes, now).reason, "registration_not_confirmed");
  console.log("BHY local tunnel status rejects dead, stale, and foreign registration receipts");
} finally { fs.rmSync(dir, {recursive:true,force:true}); }
