// B"H
const { addRemainingWork } = require("./missionLedger");
function discoverShadowWork(mission, event = {}) {
  const subject = event.subject || event.file || event.summary || "recent mission change";
  return addRemainingWork(mission, [`Add or verify tests for ${subject}`, `Document handoff notes for ${subject}`, `Review planned-vs-actual delta for ${subject}`, `Verify continuation gate after ${subject}`]);
}
module.exports = { discoverShadowWork };
