#!/usr/bin/env node
// B"H
/** Repair canonical live packed comment branches that read as byte buffers instead of comment objects. */
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const DosDB = require('../../ayzarim/DosDB/index.js');
const legacy = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON/index.js');

const DB_ROOT = '/Users/awtsmoos/Documents/awtsmoos/dayuhChadash';
const RAG = path.join(DB_ROOT, 'ai/comment-rag');
const ARCHIVE_ROOT = path.join(RAG, 'all_remaining_likkutei_comment_sidecars_archived_20260707_100732');
const APPLY = process.argv.includes('--apply');
const VOLUMES = volumesFrom(process.argv.find(a => a.startsWith('--volumes='))?.split('=')[1] || '16-39');
const RUN = path.join(RAG, `repair_likkutei_v16_v39_live_comment_objects_${new Date().toISOString().replace(/[:.]/g,'-')}`);

function volumesFrom(spec){const out=[]; for(const part of String(spec).split(',')){const t=part.trim(); const r=t.match(/^(\d+)-(\d+)$/); if(r) for(let i=+r[1];i<=+r[2];i++) out.push(i); else if(t) out.push(+t);} return [...new Set(out)].filter(Number.isFinite).sort((a,b)=>a-b);}
function count(o){return Object.entries(o||{}).reduce((n,[k,v])=>/^\d+$/.test(k)&&Array.isArray(v)?n+v.length:n,0)}
function files(volume){const seriesId=`likkuteiSichosVolume${volume}`; const base=path.join(ARCHIVE_ROOT,'social/heichelos/ikar/comments/atSeries',seriesId,'atPost'); if(!fs.existsSync(base)) return []; return fs.readdirSync(base).sort().map(postId=>({volume,seriesId,postId,file:path.join(base,postId,'likkutei_translation_en.awtsmoosJSON'),logical:`/social/heichelos/ikar/comments/atSeries/${seriesId}/atPost/${postId}/likkutei_translation_en`})).filter(x=>fs.existsSync(x.file));}
function readArchive(file){return legacy.deserializeBinary(fs.readFileSync(file));}
function isBufferLike(o){if(!o||typeof o!=='object'||Array.isArray(o)||Buffer.isBuffer(o)) return false; const ks=Object.keys(o); if(!ks.length) return false; return ks.slice(0,20).every(k=>/^\d+$/.test(k) && typeof o[k]==='number');}

async function main(){fs.mkdirSync(RUN,{recursive:true}); const db=new DosDB(DB_ROOT); await db.init?.(); const report={BH:'B"H',apply:APPLY,run:RUN,seen:0,archiveReadable:0,okLive:0,needsRepair:0,repaired:0,skipped:[],samples:[]}; for(const e of VOLUMES.flatMap(files)){report.seen++; let arch; try{arch=readArchive(e.file)}catch(err){report.skipped.push({logical:e.logical,reason:'archive_unreadable',error:String(err.message||err)}); continue;} const archCount=count(arch); if(!archCount){report.skipped.push({logical:e.logical,reason:'archive_zero'}); continue;} report.archiveReadable++; const live=await db.get(e.logical).catch(()=>null); const liveCount=count(live); if(liveCount===archCount){report.okLive++; continue;} if(!isBufferLike(live) && liveCount>0){report.skipped.push({logical:e.logical,reason:'live_count_mismatch_not_buffer',liveCount,archCount}); continue;} report.needsRepair++; if(APPLY){await db.write(e.logical, arch); const after=await db.get(e.logical).catch(()=>null); const afterCount=count(after); if(afterCount===archCount){report.repaired++; if(report.samples.length<12) report.samples.push({logical:e.logical,archCount,afterCount});} else report.skipped.push({logical:e.logical,reason:'repair_verify_failed',archCount,afterCount});} else if(report.samples.length<12) report.samples.push({logical:e.logical,archCount,liveCount,bufferLike:isBufferLike(live)}); }
fs.writeFileSync(path.join(RUN,'summary.json'), JSON.stringify(report,null,2)); console.log(JSON.stringify(report,null,2));}
main().catch(e=>{console.error(e.stack||e); process.exit(1)});
