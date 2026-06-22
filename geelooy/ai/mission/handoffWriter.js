// B"H
const fs = require("fs");
const path = require("path");
const { clone, nowIso } = require("./state");
const { evidenceSummaries } = require("./evidenceLedger");
const { DEFAULT_DIR } = require("./checkpointStore");
function safeName(value) { return String(value).replace(/[^a-zA-Z0-9_.-]/g, "_"); }
function writeHandoff(mission, dir = DEFAULT_DIR) {
  const next = clone(mission); const folder = path.join(dir, safeName(next.id)); fs.mkdirSync(folder, { recursive: true });
  const file = path.join(folder, `handoff-${nowIso().replace(/[:.]/g, "-")}.md`);
  const body = [`# B\"H Mission Handoff: ${next.title}`, "", `Goal: ${next.goal}`, `Status: ${next.status}`, `Remaining work: ${(next.remainingWork || []).join("; ") || "none"}`, `Next action: ${next.nextAction ? next.nextAction.summary : "none"}`, "", "## Evidence", ...evidenceSummaries(next).map(line => `- ${line}`), "", "Mail-to-self mode: durable handoff file only; no real email sent."].join("\n");
  fs.writeFileSync(file, body); next.handoffs.push({ path: file, createdAt: nowIso(), mode: "durable-file" }); next.updatedAt = nowIso(); return next;
}
module.exports = { writeHandoff };
