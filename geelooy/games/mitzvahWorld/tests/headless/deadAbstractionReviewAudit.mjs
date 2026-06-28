// B"H
/** DeadAbstractionReviewAudit: groups one-use abstractions into review shelves. */
import fs from 'node:fs';
const dead=JSON.parse(fs.readFileSync('AI_THOUGHTS/architecture_reports/latest_dead_abstraction_candidates.json','utf8'));
function kind(file){return (file.match(/(Adapter|Bridge|Registry|Manager|Policy|Factory)\.js$/)||['','Other'])[1];}
function domain(file){if(file.startsWith('systems/universe/'))return 'alternate-universe'; if(file.startsWith('systems/'))return 'systems'; if(file.startsWith('ckidsAwtsmoos/Olam/'))return 'legacy-olam'; if(file.startsWith('ckidsAwtsmoos/'))return 'ckidsAwtsmoos'; return 'other';}
const rows=(dead.candidates||[]).map(r=>({...r,kind:kind(r.file),domain:domain(r.file),priority:kind(r.file)==='Manager'?70:kind(r.file)==='Bridge'?60:50,deleteReady:false}));
const groups={}; for(const r of rows){const key=`${r.domain}:${r.kind}`; (groups[key]||=[]).push(r.file);}
const report={ok:true,total:dead.candidatesCount,groups:Object.fromEntries(Object.entries(groups).map(([k,v])=>[k,{count:v.length,files:v.slice(0,25)}])),rows};
fs.writeFileSync('AI_THOUGHTS/architecture_reports/latest_dead_abstraction_review.json',JSON.stringify(report,null,2));
console.log(JSON.stringify({ok:true,total:report.total,groups:Object.fromEntries(Object.entries(report.groups).map(([k,v])=>[k,v.count]))},null,2));
