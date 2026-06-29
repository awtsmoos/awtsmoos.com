// B"H
/** ArchitectureRegressionCompareAudit: compares latest snapshot to the previous one. */
import fs from 'node:fs';
const dir='AI_THOUGHTS/architecture_reports/snapshots';
const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort():[];
const latest=files.at(-1); const previous=files.at(-2)||null;
function read(name){return name?JSON.parse(fs.readFileSync(`${dir}/${name}`,'utf8')):null;}
const a=read(previous); const b=read(latest);
const diffs={};
if(a&&b){for(const key of Object.keys({...a.metrics,...b.metrics}))diffs[key]=(b.metrics[key]||0)-(a.metrics[key]||0);}
const watched=['boundaryViolations','ownerlessClaims','duplicateOwners','deletionReady','removalBlockers','prototypeBootViolations'];
const regressions=Object.entries(diffs).filter(([k,v])=>watched.includes(k)&&v>0).map(([metric,delta])=>({metric,delta}));
const report={ok:regressions.length===0,latest,previous,diffs,regressions,note:previous?'Compared latest to previous snapshot.':'Only one snapshot exists; comparison is informational.'};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_architecture_regression_compare.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:report.ok,latest,previous,regressions},null,2));
if(!report.ok)process.exit(1);
