// B"H
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const DB_ROOT='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const DB_FILE=path.join(DB_ROOT,'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const RUN=path.join(DB_ROOT,'ai/comment-rag',`direct_comment_mv_${new Date().toISOString().replace(/[:.]/g,'-')}`);
const SUMMARY_DIRS=[path.join(DB_ROOT,'ai/comment-rag'),'/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work'];
function collect(){const out=new Set(); for(const dir of SUMMARY_DIRS){if(!fs.existsSync(dir)) continue; for(const n of fs.readdirSync(dir)){const f=path.join(dir,n,'summary.json'); if(!fs.existsSync(f)) continue; let j; try{j=JSON.parse(fs.readFileSync(f,'utf8'))}catch{continue} if(!j.apply) continue; for(const w of j.writes||[]) if(w.path) out.add(w.path.replace(/\.(awtsmoosJSON|json)$/i,'')); for(const p of j.paths||[]) if(p.path) out.add(p.path.replace(/\.(awtsmoosJSON|json)$/i,''));}} return [...out].sort();}
async function main(){fs.mkdirSync(RUN,{recursive:true}); const backup=path.join(RUN,path.basename(DB_FILE)+'.before'); fs.copyFileSync(DB_FILE,backup); const db=new AwtsmoosDB(DB_FILE,{debug:false}); await db.open(); const report={BH:'B"H',run:RUN,backup,paths:0,moved:0,alreadyExtensionless:0,missingOld:0,targetExists:0,skipped:[]}; for(const p of collect()){report.paths++; const old=p+'.awtsmoosJSON'; const oldStat=db.fs.stat(old); const newStat=db.fs.stat(p); if(newStat?.exists && !oldStat?.exists){report.alreadyExtensionless++; continue;} if(!oldStat?.exists){report.missingOld++; report.skipped.push({path:p,reason:'old_missing'}); continue;} if(newStat?.exists){report.targetExists++; report.skipped.push({path:p,reason:'target_exists_old_also_exists'}); continue;} const ok=db.fs.mv(old,p); if(ok) report.moved++; else report.skipped.push({path:p,reason:'mv_returned_false'}); } db.fs.flush?.(); db.pager?.close?.(); db.processLock?.release?.(); fs.writeFileSync(path.join(RUN,'summary.json'),JSON.stringify(report,null,2)); console.log(JSON.stringify({run:RUN,backup,paths:report.paths,moved:report.moved,alreadyExtensionless:report.alreadyExtensionless,missingOld:report.missingOld,targetExists:report.targetExists,skipped:report.skipped.length},null,2));}
main().catch(e=>{console.error(e.stack||e);process.exit(1)});
