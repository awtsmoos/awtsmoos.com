#!/usr/bin/env node
// B"H
/** Rebuild the fast index from existing vectors, keeping only records that materialize from live DB. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require=createRequire(import.meta.url);
const AwtsmoosDB=require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy=require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const DB_ROOT='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG=path.join(DB_ROOT,'ai/comment-rag');
const INDEX=path.join(RAG,'likkutei-v01-v39-fast-index');
const META=path.join(INDEX,'meta.jsonl');
const VEC=path.join(INDEX,'vectors.f32');
const SUMMARY=path.join(INDEX,'summary.json');
const COMMENTS_DB=path.join(DB_ROOT,'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const DIM=384;
function open(){const db=new AwtsmoosDB(COMMENTS_DB,{debug:false,readOnly:true,processLockMode:'shared',lockMode:'shared'}); db.open(); return db;}
function close(db){try{db.pager?.close?.();db.processLock?.release?.()}catch{}}
function readBranch(db,p){const st=db.fs.stat(p); if(!st?.exists)return null; try{return legacy.deserializeBinary(db.fs.cat(p))}catch{return null}}
function rows(o){return Object.keys(o||{}).filter(k=>/^\d+$/.test(k)).sort((a,b)=>+a-+b).flatMap(k=>Array.isArray(o[k])?o[k]:[])}
function inRange(row,r){const sec=+(row?.verseSection??row?.dayuh?.verseSection); return Number.isFinite(sec)&&sec>=+r.verseStart&&sec<=+r.verseEnd}
function hasText(row){return String(row?.content||'').trim().length>0}
function volumeStatsPush(map,volume,kind){if(!map.has(volume))map.set(volume,{volume,kept:0,dropped:0}); map.get(volume)[kind]++;}
function main(){const stamp=new Date().toISOString().replace(/[:.]/g,'-'); const backup=path.join(INDEX,`backup_before_live_only_${stamp}`); fs.mkdirSync(backup,{recursive:true}); for(const f of [META,VEC,SUMMARY]) if(fs.existsSync(f)) fs.copyFileSync(f,path.join(backup,path.basename(f)));
 const meta=fs.readFileSync(META,'utf8').trim().split('\n').map(JSON.parse); const buf=fs.readFileSync(VEC); const old=new Float32Array(buf.buffer,buf.byteOffset,buf.byteLength/4); if(old.length!==meta.length*DIM) throw new Error('vector/meta mismatch'); const db=open(); const cache=new Map(); const kept=[]; const dropped=[]; const stats=new Map();
 for(let i=0;i<meta.length;i++){const r=meta[i]; let b=cache.get(r.commentPath); if(!b){b=readBranch(db,r.commentPath); cache.set(r.commentPath,b);} const hit=rows(b).filter(row=>inRange(row,r)&&hasText(row)); if(!hit.length){dropped.push({index:i,id:r.id,volume:r.volume,postId:r.postId,verses:[r.verseStart,r.verseEnd],commentPath:r.commentPath,reason:'zero_live_text_rows'}); volumeStatsPush(stats,r.volume,'dropped'); continue;} const ids=hit.map(x=>x.id).filter(Boolean); kept.push({oldIndex:i,meta:{...r,index:kept.length,commentIds:ids,firstCommentId:ids[0]||'',lastCommentId:ids.at(-1)||'',commentCount:hit.length,archiveFile:null}}); volumeStatsPush(stats,r.volume,'kept'); }
 close(db); const out=Buffer.allocUnsafe(kept.length*DIM*4); for(let ni=0;ni<kept.length;ni++){const oi=kept[ni].oldIndex; for(let d=0;d<DIM;d++) out.writeFloatLE(old[oi*DIM+d],(ni*DIM+d)*4);}
 fs.writeFileSync(VEC,out); fs.writeFileSync(META,kept.map(k=>JSON.stringify(k.meta)).join('\n')+'\n'); const metaText=fs.readFileSync(META,'utf8'); const vols=[...stats.values()].sort((a,b)=>a.volume-b.volume); const summary={BH:'B"H", live-only fast index',records:kept.length,droppedRecords:dropped.length,oldRecords:meta.length,dimensions:DIM,uniqueIds:new Set(kept.map(k=>k.meta.id)).size,volumes:{first:vols[0]?.volume,last:vols.at(-1)?.volume,count:vols.length},all39VolumesPresent:vols.length===39&&vols[0]?.volume===1&&vols.at(-1)?.volume===39,metaPolicy:'reference-only live-db only; no baked text; commentIds populated from live rows',bakedTextFields:/"text"\s*:|"sample"\s*:|"sampleContent"\s*:|EN:/.test(metaText)?'FAILED':'none detected',backup,droppedSamples:dropped.slice(0,80),volumeStats:vols,finished:new Date().toISOString()}; fs.writeFileSync(SUMMARY,JSON.stringify(summary,null,2)); console.log(JSON.stringify({records:summary.records,droppedRecords:summary.droppedRecords,oldRecords:summary.oldRecords,all39VolumesPresent:summary.all39VolumesPresent,bakedTextFields:summary.bakedTextFields,backup:summary.backup,droppedSamples:summary.droppedSamples.slice(0,20),volumeStats:summary.volumeStats},null,2));}
main();
