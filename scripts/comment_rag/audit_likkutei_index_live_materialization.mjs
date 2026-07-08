#!/usr/bin/env node
// B"H
/** Audit every fast-index record against the live packed comments DB. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const DB_ROOT='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG=path.join(DB_ROOT,'ai/comment-rag');
const COMMENTS_DB=path.join(DB_ROOT,'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const META=path.join(RAG,'likkutei-v01-v39-fast-index/meta.jsonl');
const RUN=path.join(RAG,`audit_likkutei_index_live_materialization_${new Date().toISOString().replace(/[:.]/g,'-')}`);
function open(){const db=new AwtsmoosDB(COMMENTS_DB,{debug:false,readOnly:true,processLockMode:'shared',lockMode:'shared'}); db.open(); return db;}
function close(db){try{db.pager?.close?.();db.processLock?.release?.()}catch{}}
function readObj(db,p){const st=db.fs.stat(p); if(!st?.exists)return {ok:false,reason:'missing_path'}; try{return {ok:true,obj:legacy.deserializeBinary(db.fs.cat(p))}}catch(e){return {ok:false,reason:'deserialize_failed',error:String(e.message||e)}}}
function rows(o){return Object.keys(o||{}).filter(k=>/^\d+$/.test(k)).sort((a,b)=>+a-+b).flatMap(k=>Array.isArray(o[k])?o[k]:[])}
function inRange(row,r){const sec=+(row?.verseSection??row?.dayuh?.verseSection); return Number.isFinite(sec)&&sec>=+r.verseStart&&sec<=+r.verseEnd}
function textRows(rs){return rs.filter(row=>String(row?.content||'').trim()).length}
function main(){fs.mkdirSync(RUN,{recursive:true}); const meta=fs.readFileSync(META,'utf8').trim().split('\n').map(JSON.parse); const db=open(); const cache=new Map(); const volumeStats=new Map(); const bad=[]; let okRecords=0, missingRows=0, missingIds=0, blankTexts=0;
for(const r of meta){let branch=cache.get(r.commentPath); if(!branch){branch=readObj(db,r.commentPath); cache.set(r.commentPath,branch)} const all=branch.ok?rows(branch.obj):[]; const hitRows=all.filter(row=>inRange(row,r)); const liveIds=new Set(hitRows.map(x=>x?.id).filter(Boolean)); const expected=(r.commentIds||[]).filter(Boolean); const missingExpected=expected.filter(id=>!liveIds.has(id)); const withText=textRows(hitRows); const issue=!branch.ok?branch.reason:!hitRows.length?'zero_rows_in_range':withText!==hitRows.length?'blank_text_in_range':missingExpected.length?'missing_expected_ids':null;
 if(!volumeStats.has(r.volume)) volumeStats.set(r.volume,{volume:r.volume,records:0,ok:0,bad:0,rows:0,withText:0,expectedIds:0,missingExpectedIds:0}); const v=volumeStats.get(r.volume); v.records++; v.rows+=hitRows.length; v.withText+=withText; v.expectedIds+=expected.length; v.missingExpectedIds+=missingExpected.length;
 if(issue){v.bad++; if(!branch.ok||!hitRows.length) missingRows++; if(missingExpected.length) missingIds+=missingExpected.length; if(withText!==hitRows.length) blankTexts++; if(bad.length<400) bad.push({index:r.index,id:r.id,volume:r.volume,postId:r.postId,verses:[r.verseStart,r.verseEnd],commentPath:r.commentPath,issue,hitRows:hitRows.length,withText,expectedIds:expected.length,missingExpectedIds:missingExpected.length,missingSample:missingExpected.slice(0,5)});}
 else {v.ok++; okRecords++;}
}
close(db); const vols=[...volumeStats.values()].sort((a,b)=>a.volume-b.volume); const report={run:RUN,records:meta.length,okRecords,badRecords:meta.length-okRecords,missingRows,missingIds,blankTexts,volumesPresent:vols.map(v=>v.volume),all39VolumesPresent:vols.length===39&&vols[0]?.volume===1&&vols.at(-1)?.volume===39,volumeStats:vols,badSamples:bad}; fs.writeFileSync(path.join(RUN,'summary.json'),JSON.stringify(report,null,2)); console.log(JSON.stringify({run:report.run,records:report.records,okRecords:report.okRecords,badRecords:report.badRecords,missingRows:report.missingRows,missingIds:report.missingIds,blankTexts:report.blankTexts,all39VolumesPresent:report.all39VolumesPresent,badSamples:report.badSamples.slice(0,40),volumeStats:report.volumeStats},null,2));}
main();
