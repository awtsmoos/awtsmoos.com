// B"H
/** UnreachableBreakdownAudit: static unreachable is a map, not a deletion verdict. */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
function bucket(file){
  if(file.startsWith('tests/'))return 'test';
  if(file.startsWith('tools/'))return 'tooling';
  if(file.includes('/feature49/')||file.includes('/feature100/'))return 'generated-feature-prototype';
  if(file.startsWith('systems/universe/'))return 'alternate-universe-stack';
  if(file.includes('/postbuild/'))return 'postbuild-hook';
  if(file.startsWith('ckidsAwtsmoos/Olam/'))return 'legacy-olam-engine';
  if(file.startsWith('ckidsAwtsmoos/tochen/'))return 'content-library';
  if(file.startsWith('data/'))return 'data-or-fixture';
  if(file.startsWith('systems/'))return 'runtime-or-ui-library';
  return 'other-static-unreachable';
}
const rows=(graph.unreachable||[]).map(file=>({file,bucket:bucket(file),deleteReady:false,reason:'static unreachable only; import graph roots are conservative'}));
const summary=rows.reduce((a,r)=>{a[r.bucket]=(a[r.bucket]||0)+1;return a;},{});
const report={ok:true,totalReported:rows.length,totalUnreachable:graph.unreachableCount,summary,rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_unreachable_breakdown.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,totalUnreachable:graph.unreachableCount,reported:rows.length,summary},null,2));
