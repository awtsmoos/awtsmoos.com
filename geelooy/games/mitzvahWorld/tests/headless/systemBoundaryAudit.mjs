// B"H
/**
 * SystemBoundaryAudit
 *
 * Boundaries are not fantasy walls; they are named gates. Known legacy/tooling
 * crossings are monitored with evidence. New silent crossings remain critical.
 */
import fs from 'node:fs';
const graph=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_import_graph.json','utf8'));
const allowed={
  boot:new Set(['boot','ui','performance','other','living-world','world']),
  ui:new Set(['ui','other','alternate-universe','performance']),
  performance:new Set(['performance','other','living-world']),
  'living-world':new Set(['living-world','village','world','ui','other']),
  village:new Set(['village','ui','other','living-world']),
  world:new Set(['world','ui','other','living-world']),
  testing:new Set(['boot','ui','performance','other','living-world','world','village','prototype','alternate-universe','postbuild','testing']),
  postbuild:new Set(['postbuild','alternate-universe','other','village']),
  prototype:new Set(['prototype','other']),
  'alternate-universe':new Set(['alternate-universe','other']),
  other:new Set(['other','ui','performance','living-world','world','village','postbuild','testing'])
};
function monitored(e){
  if(e.from.startsWith('systems/ui/universe/')&&e.toDomain==='alternate-universe')return 'query-gated-universe-tool';
  if(e.fromDomain==='prototype'&&e.to.includes('/livingWorld/LivingWorldRuntime.js'))return 'prototype-imports-live-owner-monitor-before-archive';
  if(e.from.startsWith('tools/')&&e.to.startsWith('tests/chrome/'))return 'tool-uses-chrome-test-helper';
  if(e.toDomain==='postbuild'&&/WorldHeescheel|loadNivrayim|ProceduralCoreGrassField/.test(e.from))return 'legacy-runtime-postbuild-hook';
  if(e.fromDomain==='postbuild'&&e.toDomain==='village')return 'postbuild-village-polish-input';
  return null;
}
const allCrossings=graph.edges.filter(e=>e.internal&&!(allowed[e.fromDomain]||new Set()).has(e.toDomain));
const monitoredCrossings=[];
const violations=[];
for(const e of allCrossings){const reason=monitored(e); if(reason) monitoredCrossings.push({...e,reason}); else violations.push(e);}
const report={ok:violations.length===0,criticalViolations:violations,monitoredCrossings,checked:graph.internalEdgeCount,policy:Object.fromEntries(Object.entries(allowed).map(([k,v])=>[k,[...v]]))};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_system_boundary_audit.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,checked:report.checked,criticalViolations:violations.length,monitoredCrossings:monitoredCrossings.length},null,2));
if(!report.ok)process.exit(1);
