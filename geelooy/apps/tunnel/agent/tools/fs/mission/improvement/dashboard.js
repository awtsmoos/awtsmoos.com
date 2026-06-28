// B"H
function dashboard(report={}, ranked=[], tx=null) {
  return { ok:true, action:'missionImprovementDashboard', phase:'continuous-improvement', totals:report.totals||{}, topDebt:ranked.slice(0,10).map(x=>({ path:x.path, kind:x.kind, score:x.score, reason:x.reason })), transaction: tx ? { id:tx.id, dryRun:tx.dryRun, steps:tx.steps.length, gates:tx.gates } : null, plainEnglishAllCaps:'CONTINUOUS IMPROVEMENT IS ACTIVE. DISCOVER, SCORE, SIMULATE, TRANSACT, VERIFY, MEASURE, THEN CONTINUE.' };
}
module.exports = { dashboard };
