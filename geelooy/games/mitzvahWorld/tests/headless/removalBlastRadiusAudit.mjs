// B"H
/** RemovalBlastRadiusAudit: what breaks if the candidate disappears? */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const candidates=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_removal_candidates.json','utf8'));
const rows=candidates.candidates.map(c=>({file:c.file,classification:c.classification,directImporters:graph.edges.filter(e=>e.to===c.file).map(e=>e.from),deleteReady:false}));
const report={ok:true,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_removal_blast_radius.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:rows.length,zeroImporters:rows.filter(r=>r.directImporters.length===0).length},null,2));
