#!/usr/bin/env node
// B"H
/** Verify live comments against Hebrew posts in the packed series DB. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const AwtsmoosDB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');
const DB_ROOT='/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG=path.join(DB_ROOT,'ai/comment-rag');
const COMMENTS_DB=path.join(DB_ROOT,'socialPacked/social.heichel.ikar.comments.fs.awtsdb');
const SERIES_DB=path.join(DB_ROOT,'socialPacked/social.heichel.ikar.series.fs.awtsdb');
const META=path.join(RAG,'likkutei-v01-v39-fast-index/meta.jsonl');
const RUN=path.join(RAG,`verify_likkutei_live_database_v01_v39_${new Date().toISOString().replace(/[:.]/g,'-')}`);
function open(file){const db=new AwtsmoosDB(file,{debug:false,readOnly:true,processLockMode:'shared',lockMode:'shared'}); db.open(); return db;}
function close(db){try{db.pager?.close?.();db.processLock?.release?.()}catch{}}
function readObj(db,p){const st=db.fs.stat(p); if(!st?.exists) return null; const b=db.fs.cat(p); try{return legacy.deserializeBinary(b)}catch{return null}}
function count(o){return Object.entries(o||{}).reduce((n,[k,v])=>/^\d+$/.test(k)&&Array.isArray(v)?n+v.length:n,0)}
function rows(o){return Object.keys(o||{}).filter(k=>/^\d+$/.test(k)).sort((a,b)=>+a-+b).flatMap(k=>Array.isArray(o[k])?o[k]:[])}
function norm(x){return String(x||'').replace(/<[^>]+>/g,'').replace(/&lt;[^&]*?&gt;/g,'').replace(/\s+/g,' ').trim()}
function refs(){const m=new Map(); for(const line of fs.readFileSync(META,'utf8').split(/\n/).filter(Boolean)){const r=JSON.parse(line); if(!m.has(r.commentPath)) m.set(r.commentPath,{volume:+r.volume,seriesId:r.seriesId,postId:r.postId,commentPath:r.commentPath,ids:new Set(),chunks:0}); const x=m.get(r.commentPath); x.chunks++; for(const id of r.commentIds||[]) x.ids.add(id);} return [...m.values()].sort((a,b)=>a.volume-b.volume||a.commentPath.localeCompare(b.commentPath));}
fs.mkdirSync(RUN,{recursive:true});
const cdb=open(COMMENTS_DB), sdb=open(SERIES_DB); const seriesCache=new Map();
const volumeStats=new Map(); const samples=[];
for(const ref of refs()){
 const branch=readObj(cdb,ref.commentPath); const rs=rows(branch); const idset=new Set(rs.map(r=>r?.id).filter(Boolean));
 let smap=seriesCache.get(ref.seriesId); if(!smap){smap=readObj(sdb,`/social/heichelos/ikar/series/${ref.seriesId}/posts`); seriesCache.set(ref.seriesId,smap)}
 const post=smap?.[ref.postId]; let miss=0; for(const id of ref.ids) if(!idset.has(id)) miss++;
 let withEn=0, withHe=0, slot=0; for(const r of rs){const en=norm(r?.content); const he=norm(r?.sourceHebrew||r?.dayuh?.sourceHebrew); if(en) withEn++; if(he) withHe++; const sec=+(r?.verseSection??r?.dayuh?.verseSection); const sub=+(r?.subSection??r?.dayuh?.subSection); const ph=norm(post?.dayuh?.sections?.[sec]?.[sub]); if(he&&ph&&he===ph) slot++;}
 const issue=!branch?'missing_live_comments':!rs.length?'zero_live_comments':!post?'missing_hebrew_post':!post?.dayuh?.sections?.length?'missing_hebrew_sections':miss?'missing_indexed_ids':withEn!==rs.length?'blank_english':withHe!==rs.length?'blank_hebrew':slot!==rs.length?'hebrew_slot_mismatch':null;
 if(!volumeStats.has(ref.volume)) volumeStats.set(ref.volume,{volume:ref.volume,refs:0,liveRefs:0,hebrewPosts:0,comments:0,indexedIds:0,missingIndexedIds:0,rows:0,rowsWithEnglish:0,rowsWithHebrew:0,rowsMatchingHebrewSlot:0,issues:0});
 const v=volumeStats.get(ref.volume); v.refs++; v.liveRefs+=rs.length?1:0; v.hebrewPosts+=post?1:0; v.comments+=count(branch); v.indexedIds+=ref.ids.size; v.missingIndexedIds+=miss; v.rows+=rs.length; v.rowsWithEnglish+=withEn; v.rowsWithHebrew+=withHe; v.rowsMatchingHebrewSlot+=slot; if(issue){v.issues++; if(samples.length<120) samples.push({volume:ref.volume,seriesId:ref.seriesId,postId:ref.postId,commentPath:ref.commentPath,issue,comments:rs.length,indexedIds:ref.ids.size,missingIndexedIds:miss,withEn,withHe,slot,postSections:post?.dayuh?.sections?.length||0});}
}
close(cdb); close(sdb);
const vols=[...volumeStats.values()].sort((a,b)=>a.volume-b.volume);
const report={BH:'B"H',run:RUN,refs:vols.reduce((n,v)=>n+v.refs,0),volumesPresent:vols.map(v=>v.volume),volumesCount:vols.length,all39VolumesPresent:vols.length===39&&vols[0]?.volume===1&&vols.at(-1)?.volume===39,totalLiveComments:vols.reduce((n,v)=>n+v.comments,0),totalIndexedIds:vols.reduce((n,v)=>n+v.indexedIds,0),totalMissingIndexedIds:vols.reduce((n,v)=>n+v.missingIndexedIds,0),totalRows:vols.reduce((n,v)=>n+v.rows,0),totalRowsWithEnglish:vols.reduce((n,v)=>n+v.rowsWithEnglish,0),totalRowsWithHebrew:vols.reduce((n,v)=>n+v.rowsWithHebrew,0),totalRowsMatchingHebrewSlot:vols.reduce((n,v)=>n+v.rowsMatchingHebrewSlot,0),totalIssues:vols.reduce((n,v)=>n+v.issues,0),volumeStats:vols,issueSamples:samples};
fs.writeFileSync(path.join(RUN,'summary.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify({run:report.run,refs:report.refs,volumesCount:report.volumesCount,all39VolumesPresent:report.all39VolumesPresent,totalLiveComments:report.totalLiveComments,totalRowsWithEnglish:report.totalRowsWithEnglish,totalRowsWithHebrew:report.totalRowsWithHebrew,totalRowsMatchingHebrewSlot:report.totalRowsMatchingHebrewSlot,totalMissingIndexedIds:report.totalMissingIndexedIds,totalIssues:report.totalIssues,issueSamples:report.issueSamples.slice(0,10),volumeStats:report.volumeStats},null,2));
