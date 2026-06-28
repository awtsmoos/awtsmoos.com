// B"H
/** FeatureMaturityIndexAudit: every feature receives a measured rung, not a crown. */
import fs from 'node:fs';
const rows=JSON.parse(fs.readFileSync('AI_THOUGHTS/feature_connectivity_reports/latest_feature_classification.json','utf8')).rows;
const browser=false;
function score(r){let s=0; if(!r.classification.includes('unknown'))s+=20; if(!r.classification.includes('needs-owner'))s+=20; if(r.classification.includes('starter-zone'))s+=20; if(r.classification.includes('library-only'))s+=15; if(r.classification.includes('dormant'))s+=10; if(r.classification.includes('prototype'))s+=5; if(r.classification.includes('alternate'))s+=8; if(browser)s+=15; return Math.min(100,s);}
const features=rows.map(r=>({file:r.file,classification:r.classification,score:score(r),browserProof:false,mobileProof:r.classification.includes('starter-zone'),ownership:!r.classification.includes('needs-owner')}));
const report={ok:true,average:Math.round(features.reduce((a,r)=>a+r.score,0)/features.length),features};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_feature_maturity_index.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,average:report.average,total:features.length},null,2));
