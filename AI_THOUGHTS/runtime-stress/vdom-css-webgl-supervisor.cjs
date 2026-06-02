// B"H
const fs=require('fs');
const { spawnSync }=require('child_process');
const OUT='AI_THOUGHTS/runtime-stress/vdom-css-webgl-evidence.json';
const JSONL='AI_THOUGHTS/runtime-stress/vdom-css-webgl-evidence.jsonl';
const runtime=JSON.parse(fs.readFileSync('AI_THOUGHTS/runtime-stress/all-html-runtime-matrix.json','utf8'));
const all=runtime.rows.filter(x=>x.ok).map(x=>x.p);
function prior(){try{return JSON.parse(fs.readFileSync(OUT,'utf8')).rows||[]}catch{return[]}}
const by=new Map(prior().map(x=>[x.p,x]));
const args=process.argv.slice(2);
let todo=args.length?args:all.filter(p=>!by.has(p));
const limit=Number(process.env.VDOM_SUPERVISOR_LIMIT||todo.length); todo=todo.slice(0,limit);
for(const p of todo){
 const started=Date.now();
 const r=spawnSync(process.execPath,['AI_THOUGHTS/runtime-stress/vdom-css-webgl-worker.cjs',p],{encoding:'utf8',timeout:Number(process.env.VDOM_PAGE_TIMEOUT_MS||45000),env:{...process.env,MERKAVA_VDOM_EVIDENCE_MS:process.env.MERKAVA_VDOM_EVIDENCE_MS||'30000'}});
 const line=(r.stdout||'').trim().split('\n').filter(Boolean).pop();
 let row=null; try{row=line?JSON.parse(line):null}catch{}
 if(!row) row={p,at:new Date().toISOString(),ok:false,error:r.error?.message||r.stderr||'no worker result',ms:Date.now()-started};
 if(r.error&&r.error.code==='ETIMEDOUT') row={p,at:new Date().toISOString(),ok:false,error:'timeout:worker',ms:Date.now()-started};
 by.set(p,row); fs.appendFileSync(JSONL,JSON.stringify(row)+'\n');
 const rows=all.map(p=>by.get(p)).filter(Boolean);
 fs.writeFileSync(OUT,JSON.stringify({generatedAt:new Date().toISOString(),total:all.length,count:rows.length,ok:rows.filter(x=>x.ok).length,failed:rows.filter(x=>!x.ok).length,rows},null,2));
 console.log(JSON.stringify({p:row.p,ok:row.ok,error:row.error,ms:row.ms}));
}
