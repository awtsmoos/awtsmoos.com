// B"H
import fs from 'fs';
import path from 'path';
const DB_ROOT='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RUN=path.join(DB_ROOT,'ai/comment-rag',`legacy_comment_sidecars_archived_${new Date().toISOString().replace(/[:.]/g,'-')}`);
const SUMMARY_DIRS=[path.join(DB_ROOT,'ai/comment-rag'),'/Users/awtsmoos/Documents/awtsmoos/sefer hasichos/sefer_hasichos_translation_swarm_20260702_1745/work'];
function collect(){const out=new Set(); for(const dir of SUMMARY_DIRS){if(!fs.existsSync(dir)) continue; for(const n of fs.readdirSync(dir)){const f=path.join(dir,n,'summary.json'); if(!fs.existsSync(f)) continue; let j; try{j=JSON.parse(fs.readFileSync(f,'utf8'))}catch{continue} if(!j.apply) continue; for(const w of j.writes||[]) if(w.path) out.add(w.path.replace(/\.(awtsmoosJSON|json)$/i,'')); for(const p of j.paths||[]) if(p.path) out.add(p.path.replace(/\.(awtsmoosJSON|json)$/i,''));}} return [...out].sort();}
function fsPath(logical){return path.join(DB_ROOT,...logical.replace(/^\//,'').split('/'))+'.awtsmoosJSON';}
function archivePath(file){const rel=path.relative(DB_ROOT,file); return path.join(RUN,rel);}
fs.mkdirSync(RUN,{recursive:true});
const report={BH:'B"H',run:RUN,known:0,archived:0,missing:0,examples:[]};
for(const logical of collect()){report.known++; const f=fsPath(logical); if(!fs.existsSync(f)){report.missing++; continue;} const dst=archivePath(f); fs.mkdirSync(path.dirname(dst),{recursive:true}); fs.renameSync(f,dst); report.archived++; if(report.examples.length<5) report.examples.push({from:f,to:dst});}
fs.writeFileSync(path.join(RUN,'summary.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({run:RUN,known:report.known,archived:report.archived,missing:report.missing,examples:report.examples},null,2));
