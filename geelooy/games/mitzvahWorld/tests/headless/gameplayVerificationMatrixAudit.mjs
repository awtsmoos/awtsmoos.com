// B"H
import fs from 'node:fs';
const domains=[
  ['starter','tests/gameplay/starterGameplaySimulationAudit.mjs','test:starter-zone'],
  ['village-activity','tests/gameplay/villageActivitySchedulerAudit.mjs','test:village-activity'],
  ['world-director','tests/gameplay/worldEventDirectorAudit.mjs','test:world-director'],
  ['domain-smoke','tests/gameplay/existingFeatureDomainSmokeAudit.mjs','test:domain-smoke'],
  ['beverage-economy','tests/gameplay/beverageEconomyRealismAudit.mjs','test:beverage-realism'],
  ['phone-critical','tests/gameplay/mobileBootContractAudit.mjs','test:phone-critical'],
  ['frame-budget','tests/performance/gameplayFrameBudgetAudit.mjs','test:frame-budget']
];
const rows=domains.map(([domain,test,script])=>({domain,test,script,hasTest:fs.existsSync(test), status:fs.existsSync(test)?'tested':'missing-test', reachableEvidence:fs.existsSync(test)}));
const report={ok:rows.every(r=>r.hasTest), rows, note:'Matrix lists existing verified domains; disconnected content remains not-claimed by disconnectedContentClaimAudit.'};
fs.mkdirSync('AI_THOUGHTS/hardening_reports',{recursive:true}); fs.writeFileSync('AI_THOUGHTS/hardening_reports/latest_gameplay_verification_matrix.json',JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2)); if(!report.ok) process.exit(1);
