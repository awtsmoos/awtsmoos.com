// B"H
const { clone, nowIso } = require("./state");
const { evaluateCompletionGate } = require("./continuationGate");
function interrogateCompletion(mission) {
  const gate = evaluateCompletionGate(mission); const answer = gate.ok ? "A" : "B";
  const note = gate.ok ? "yes, verified" : `no, remaining work exists: ${gate.failures.join("; ")}`;
  const record = { id: `mc_${Date.now()}`, question: "Is this mission complete?", choices: ["A. yes, verified", "B. no, remaining work exists", "C. blocked by missing user decision", "D. unsafe to continue"], answer, note, createdAt: nowIso() };
  const next = clone(mission); next.multipleChoiceSelfInterrogations.push(record); next.updatedAt = nowIso(); return next;
}
module.exports = { interrogateCompletion };
