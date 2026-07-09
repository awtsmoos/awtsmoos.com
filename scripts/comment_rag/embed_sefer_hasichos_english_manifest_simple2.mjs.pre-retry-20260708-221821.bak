#!/usr/bin/env node
// B"H
/**
 * Simple 2-worker Sefer HaSichos embedder.
 * Reads ONLY manifest.embedding-english-only.safe800.jsonl.
 * Sends ONLY `text` to llama.cpp.
 * Does not open or write live DB. Flushes each vector immediately.
 */
import fs from 'fs';
import path from 'path';
import child from 'child_process';
const RAG='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash/ai/comment-rag';
const JOB=path.join(RAG,'sefer-hasichos-english-comments-embedding-job');
const MANIFEST=process.env.SHICHOSE_EMBED_MANIFEST||path.join(JOB,'manifest.embedding-english-only.safe800.jsonl');
const RESULTS=path.join(JOB,'simple2-results');
const FINAL=path.join(JOB,'vectors.jsonl');
const FAIL=path.join(JOB,'embedding-failures.jsonl');
const PROGRESS=path.join(JOB,'embedding-progress.json');
const BIN=path.join(RAG,'embedder-lab/llama.cpp/build/bin/llama-embedding');
const MODEL=path.join(RAG,'models/bge-small-en-v1.5-q8_0.gguf');
const WORKERS=Number(process.env.SHICHOSE_EMBED_WORKERS||2);
const THREADS=Number(process.env.SHICHOSE_EMBED_THREADS||1);
const RESET=process.argv.includes('--reset');
const WORKER_ID=Number(process.env.SHICHOSE_WORKER_ID??-1);
const LIMIT=Number(process.env.SHICHOSE_EMBED_LIMIT||0);
function hasHebrew(s){return /[\u0590-\u05ff]/.test(String(s||''));}
function readManifest(){let rows=fs.readFileSync(MANIFEST,'utf8').split(/\n/).filter(Boolean).map((line,index)=>({index,...JSON.parse(line)})); return LIMIT?rows.slice(0,LIMIT):rows;}
function nums(raw){return String(raw||'').match(/[-+]?(?:\d*\.\d+|\d+)(?:[eE][-+]?\d+)?/g)?.map(Number).filter(Number.isFinite)||[];}
function norm(vec){const mag=Math.sqrt(vec.reduce((s,n)=>s+n*n,0))||1; return vec.map(n=>Number((n/mag).toFixed(7)));}
function embed(text){if(!text||typeof text!=='string')throw new Error('missing text'); if(hasHebrew(text))throw new Error('Hebrew/Yiddish Unicode in text'); const r=child.spawnSync(BIN,['-m',MODEL,'-p',text,'--pooling','cls','--embd-normalize','2','--embd-output-format','raw','-t',String(THREADS)],{encoding:'utf8',maxBuffer:128*1024*1024}); if(r.status!==0)throw new Error(r.stderr||`llama exit ${r.status}`); const v=nums(r.stdout); if(v.length!==384)throw new Error(`expected 384 nums got ${v.length}`); return norm(v);}
function lineCount(f){return fs.existsSync(f)?fs.readFileSync(f,'utf8').split(/\n/).filter(Boolean).length:0;}
function progress(extra={}){let vectors=0;if(fs.existsSync(RESULTS)){for(const f of fs.readdirSync(RESULTS).filter(n=>/^worker-\d+\.jsonl$/.test(n)))vectors+=lineCount(path.join(RESULTS,f));} fs.writeFileSync(PROGRESS,JSON.stringify({BH:'B"H',phase:'simple2-embedding',manifest:MANIFEST,workers:WORKERS,vectors,failures:lineCount(FAIL),...extra,updatedAt:new Date().toISOString()},null,2));}
function record(item,vec){return {id:item.id,seriesId:item.seriesId,postId:item.postId,aliasId:item.aliasId,commentPath:item.commentPath,year:item.year,title:item.title,verseStart:item.verseStart,verseEnd:item.verseEnd,firstSubSection:item.firstSubSection,lastSubSection:item.lastSubSection,commentIds:item.commentIds,firstCommentId:item.firstCommentId,lastCommentId:item.lastCommentId,commentCount:item.commentCount,parentChunkId:item.parentChunkId,subChunkIndex:item.subChunkIndex,subChunkCount:item.subChunkCount,textPolicy:item.textPolicy,text:item.text,previewEnglish:item.previewEnglish,embeddingManifest:MANIFEST,provider:'llama-embedding:bge-small-en-v1.5-q8_0:simple2',realEmbedding:true,dimensions:vec.length,vec};}
async function worker(){fs.mkdirSync(RESULTS,{recursive:true}); const all=readManifest().filter(x=>x.index%WORKERS===WORKER_ID); const out=path.join(RESULTS,`worker-${WORKER_ID}.jsonl`); const done=new Set(); if(fs.existsSync(out)){for(const line of fs.readFileSync(out,'utf8').split(/\n/).filter(Boolean)){try{done.add(JSON.parse(line).id)}catch{}}} let n=done.size; for(const item of all){if(done.has(item.id))continue; try{const vec=embed(item.text); fs.appendFileSync(out,JSON.stringify(record(item,vec))+'\n'); done.add(item.id); n++; if(n%5===0)progress({workerId:WORKER_ID,workerDone:n,workerTotal:all.length,currentId:item.id});}catch(e){fs.appendFileSync(FAIL,JSON.stringify({workerId:WORKER_ID,index:item.index,id:item.id,error:e.stack||String(e),at:new Date().toISOString()})+'\n'); progress({workerId:WORKER_ID,failedId:item.id}); throw e;}} progress({workerId:WORKER_ID,workerDone:n,workerTotal:all.length,workerComplete:true});}
function merge(){const m=readManifest(); const by=new Map(); for(const f of fs.readdirSync(RESULTS).filter(n=>/^worker-\d+\.jsonl$/.test(n)).sort()){for(const line of fs.readFileSync(path.join(RESULTS,f),'utf8').split(/\n/).filter(Boolean)){const r=JSON.parse(line);by.set(r.id,r);}} const rows=m.filter(x=>by.has(x.id)).map(x=>by.get(x.id)); fs.writeFileSync(FINAL,rows.map(JSON.stringify).join('\n')+(rows.length?'\n':'')); return rows.length;}
async function parent(){if(RESET){if(fs.existsSync(RESULTS))fs.rmSync(RESULTS,{recursive:true,force:true}); for(const f of [FINAL,FAIL,PROGRESS])if(fs.existsSync(f))fs.rmSync(f);} fs.mkdirSync(RESULTS,{recursive:true}); const man=readManifest(); const heb=man.filter(x=>hasHebrew(x.text)).length; if(heb)throw new Error(`refusing ${heb} Hebrew text records`); progress({total:man.length,phase:'simple2-start'}); const kids=[]; for(let i=0;i<WORKERS;i++)kids.push(child.spawn(process.execPath,[new URL(import.meta.url).pathname],{cwd:process.cwd(),stdio:['ignore','inherit','inherit'],env:{...process.env,SHICHOSE_WORKER_ID:String(i),SHICHOSE_EMBED_WORKERS:String(WORKERS),SHICHOSE_EMBED_MANIFEST:MANIFEST}})); await new Promise((res,rej)=>{let left=kids.length;for(const k of kids)k.on('exit',code=>{if(code)rej(new Error(`worker ${k.pid} exited ${code}`)); else if(--left===0)res();});}); const rows=merge(); progress({phase:'simple2-completed',total:man.length,vectors:rows}); console.log(JSON.stringify({BH:'B"H',manifest:MANIFEST,total:man.length,vectors:rows,failures:lineCount(FAIL),final:FINAL},null,2));}
if(WORKER_ID>=0)worker().catch(e=>{console.error(e.stack||e);process.exit(1)}); else parent().catch(e=>{console.error(e.stack||e);process.exit(1)});
