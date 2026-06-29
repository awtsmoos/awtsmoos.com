// B"H
/** B"H — Chapter 920: Risk was counted before the gate opened. */
function riskAssessment(session = {}) {
  const reasons = []; let score = 0;
  if (session.mode === "control") add(35, "control requested");
  if (!session.requesterContact || session.requesterContact === "not provided") add(15, "requester contact missing");
  if (!session.purpose || session.purpose === "help with this device") add(10, "generic purpose");
  if (!session.scope || session.scope === "current shared target only") add(5, "generic scope");
  const ttl = Math.max(0, Number(session.expiresAt || 0) - Number(session.createdAt || 0)) / 1000;
  if (ttl > 1800) add(15, "longer than 30 minutes");
  if (ttl > 3600) add(20, "longer than 1 hour");
  const level = score >= 65 ? "high" : score >= 30 ? "medium" : "low";
  return { score, level, reasons, recommendation: level === "high" ? "deny or reduce scope" : level === "medium" ? "review carefully" : "safe to review" };
  function add(points, reason) { score += points; reasons.push(reason); }
}
module.exports = { riskAssessment };
