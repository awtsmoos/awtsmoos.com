// B"H
/**
 * DeletionConfidenceAudit
 *
 * A file is not deleted because it is quiet. It needs import evidence, owner
 * evidence, browser evidence, blast-radius evidence, and policy permission.
 * Until then the Awtsmoos keeps it named, preserved, and truthful.
 */
import fs from 'node:fs';
const plan=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_full_removal_plan.json','utf8'));
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const owner=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_runtime_ownership_graph.json','utf8'));
const blast=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_removal_blast_radius.json','utf8'));
const tiers=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_browser_evidence_tiers.json','utf8'));
const files=[...new Set(plan.subcategories.flatMap(s=>s.files||[]))];
function classification(file){return plan.subcategories.find(s=>(s.files||[]).includes(file))?.id||'unknown';}
function importers(file){return graph.edges.filter(e=>e.to===file).map(e=>e.from);}
function outgoing(file){return graph.edges.filter(e=>e.from===file).map(e=>e.to);}
function ownerKnown(file){return [...(owner.graph?.libraries||[]),...(owner.graph?.dormant||[]),...(owner.graph?.prototypes||[]),...(owner.graph?.alternate||[])].includes(file);}
const rows=files.map(file=>{
  const directImporters=importers(file);
  const out=outgoing(file);
  const blastRow=(blast.rows||[]).find(r=>r.file===file);
  const importConfidence=directImporters.length===0?80:40;
  const runtimeConfidence=ownerKnown(file)?75:20;
  const browserConfidence=tiers.chromeAvailable?70:0;
  const blastConfidence=blastRow && blastRow.directImporters.length===0?75:35;
  const policyConfidence=classification(file).includes('prototype')||classification(file).includes('alternate')?25:35;
  const deletionConfidence=Math.round((importConfidence+runtimeConfidence+browserConfidence+blastConfidence+policyConfidence)/5);
  const blockers=[];
  if(!tiers.chromeAvailable) blockers.push('no-real-browser-proof');
  if(directImporters.length) blockers.push('has-direct-importers');
  if(out.length) blockers.push('has-outgoing-dependencies-review-needed');
  blockers.push('preservation-first-policy-no-delete-now');
  return {file,classification:classification(file),importConfidence,runtimeConfidence,browserConfidence,blastConfidence,policyConfidence,deletionConfidence,deleteReady:false,directImporters,outgoingDependencies:out,blockers};
});
const report={ok:true,deleteReady:0,chromeAvailable:tiers.chromeAvailable,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_deletion_confidence.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:rows.length,deleteReady:0,avg:Math.round(rows.reduce((a,r)=>a+r.deletionConfidence,0)/rows.length)},null,2));
