// B"H
/** RuntimeOwnershipGraphAudit: one owner chain, many library vessels, no duplicate throne. */
import fs from 'node:fs';
const classification=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json','utf8'));
const ownerContracts=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_owner_contract_audit.json','utf8'));
const graph={
  liveOwnerChain:['index.html','index.js','LivingWorldRuntime','VillageActivitySchedulerRuntime','WorldEventDirectorRuntime','WorldPresentationBus','MobileCleanHudRuntime'],
  libraries:classification.rows.filter(r=>r.classification.includes('library-only')).map(r=>r.file),
  dormant:classification.rows.filter(r=>r.classification.includes('dormant')).map(r=>r.file),
  prototypes:classification.rows.filter(r=>r.classification.includes('prototype')).map(r=>r.file),
  alternate:classification.rows.filter(r=>r.classification.includes('alternate-universe')).map(r=>r.file),
  ownerContractFiles:ownerContracts.results?.map(r=>r.file)||[]
};
const duplicateOwners=[];
const ownerlessClaims=classification.rows.filter(r=>r.classification==='library-or-lazy-runtime-needs-owner'||r.classification.includes('unknown'));
const report={ok:duplicateOwners.length===0&&ownerlessClaims.length===0,duplicateOwners,ownerlessClaims,graph};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_runtime_ownership_graph.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,liveOwnerChain:graph.liveOwnerChain.length,libraries:graph.libraries.length,dormant:graph.dormant.length,prototypes:graph.prototypes.length,alternate:graph.alternate.length,ownerlessClaims:ownerlessClaims.length},null,2));
if(!report.ok)process.exit(1);
