// B"H
/** ArchitectureRegressionSnapshotAudit: freezes today so tomorrow can be compared. */
import fs from 'node:fs';
const dashboard=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_architecture_health_dashboard.json','utf8'));
const snapshot={ok:true,createdAt:new Date().toISOString(),metrics:dashboard.metrics};
fs.mkdirSync('AI_THOUGHTS/architecture_reports/snapshots',{recursive:true});
const file=`AI_THOUGHTS/architecture_reports/snapshots/${snapshot.createdAt.replace(/[:.]/g,'-')}.json`;
fs.writeFileSync(file,JSON.stringify(snapshot,null,2));
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_architecture_regression_snapshot.json',JSON.stringify({...snapshot,file},null,2));
console.log(JSON.stringify({ok:true,file,metrics:snapshot.metrics},null,2));
