// B"H
const fs = require('fs');
const path = require('path');
const DB = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../../../../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
const richPaths = require('../../comments/richCommentPaths.js');
const { loadImported } = require('../../comments/imported/orchestrator.js');
const { dbRoot } = require('./paths.js');
const { commentsForSegment } = require('./segmentComments.js');
const { importedCoordinates } = require('./importedCoordinates.js');
const cache = new Map();
async function get($i, p) { try { return await $i.db.get(p); } catch { return null; } }
function manifest($i) { try { return JSON.parse(fs.readFileSync(path.join(dbRoot($i), 'socialPacked/comment-corpus-shards.v2.manifest.json'), 'utf8')); } catch { return null; } }
function open(file) { let db=cache.get(file); if(!db){db=new DB(file,{readOnly:true,wal:false,processLockMode:'shared',lockMode:'shared'});db.open();cache.set(file,db)} return db; }
function object(file, virtualPath) { const db=open(file), p=String(virtualPath).replace(/\.(awtsmoosJSON|json)$/i,''); const s=db.fs.stat(p); return s?.exists&&s.type==='file'?awts.deserializeBinary(db.fs.readRange(p,0,s.size)):null; }
function rawVerse(row, fallback) { return row?.verseSection ?? row?.dayuh?.verseSection ?? fallback ?? ''; }
function rawSub(row) { return row?.dayuh?.subSection ?? row?.subSection ?? row?.subsection ?? ''; }
function flatten(value) { const out=[]; for(const [verse,list] of Object.entries(value||{})) if(Array.isArray(list)) for(const row of list) out.push({...row,verseSection:rawVerse(row,verse)}); return out; }
function slim(row, extra={}) {
  if(!row)return null; const aliasId=row.aliasId||row.author||row.authorAliasId||row.dayuh?.aliasId||extra.aliasId||'';
  const sourceVerse=rawVerse(row,extra.verseSection), sourceSub=rawSub(row);
  const coords=extra.imported?importedCoordinates(row,sourceVerse):{sourceVerseSection:String(sourceVerse),sourceSubSection:sourceSub===''?'':String(sourceSub),verseSection:String(sourceVerse),subSection:sourceSub};
  const subsectionId=coords.sourceSubSection===''?coords.sourceVerseSection:`${coords.sourceVerseSection}:${coords.sourceSubSection}`;
  return {...row,id:row.id,aliasId,author:row.author||aliasId,heichelId:row.heichelId||extra.heichelId||'ikar',seriesId:row.seriesId||extra.seriesId||'',postId:row.postId||row.entityId||extra.postId||'',verseSection:coords.verseSection,subsection:coords.subSection,subsectionId,sourceVerseSection:coords.sourceVerseSection,sourceSubSection:coords.sourceSubSection,coordinateBasis:extra.imported?'source-one-based-reader-zero-based':'native-reader',parentType:row.parentType||extra.parentType||'post',dayuh:{...(row.dayuh||{}),verseSection:coords.verseSection,...(coords.subSection===''?{}:{subSection:coords.subSection}),sourceVerseSection:coords.sourceVerseSection,sourceSubSection:coords.sourceSubSection}};
}
function shards($i, seriesId, aliasId) { return (manifest($i)?.shards||[]).filter(x=>fs.existsSync(x.file)&&(!seriesId||x.series?.[seriesId])&&(!aliasId||x.alias===aliasId)); }
function legacyPath({heichelId,seriesId,postId,aliasId}) { return `/social/heichelos/${heichelId}/comments/atSeries/${seriesId}/atPost/${postId}/${aliasId}`; }
function filter(rows, verse, sub) { return rows.filter(row=>(verse==null||verse===''||verse==='all'||[row.verseSection,row.sourceVerseSection].map(String).includes(String(verse)))&&(sub==null||sub===''||sub==='all'||[row.subsection,row.sourceSubSection].map(String).includes(String(sub)))); }
async function importedRows({$i,heichelId,seriesId,postId,aliasId,verseSection,subSection}) {
  const result=await loadImported({$i,heichelId,seriesId,postId,verseSection:verseSection==null?'':String(verseSection),subsectionId:subSection==null?'':String(subSection)});
  return (result.rows||[]).filter(row=>!aliasId||String(row.aliasId)===String(aliasId));
}
async function findCommentsForPostAlias(ctx) {
  const rows=[]; for(const shard of shards(ctx.$i,ctx.seriesId,ctx.aliasId)){const value=object(shard.file,legacyPath({...ctx,aliasId:shard.alias}));if(value)for(const row of flatten(value))rows.push(slim(row,{...ctx,aliasId:shard.alias,imported:true}));}
  if(!rows.length) rows.push(...await importedRows(ctx));
  return filter(rows,ctx.verseSection,ctx.subSection);
}
async function findAliasesForPost(ctx) {
  const found=[]; for(const shard of shards(ctx.$i,ctx.seriesId)) if((await findCommentsForPostAlias({...ctx,aliasId:shard.alias})).length) found.push(shard.alias);
  if(!found.length) found.push(...(await importedRows(ctx)).map(x=>x.aliasId));
  return [...new Set(found.filter(Boolean))];
}
async function findCommentById(ctx) {
  const rich=ctx.postId?await get(ctx.$i,richPaths.commentPath(ctx)):null; if(rich)return {success:slim(rich,ctx),source:'commentTree'};
  for(const aliasId of await findAliasesForPost(ctx)){const row=(await findCommentsForPostAlias({...ctx,aliasId})).find(x=>String(x.id)===String(ctx.commentId));if(row)return {success:row,source:'imported'};}
  return {error:{code:'COMMENT_NOT_FOUND',message:'Comment not found in CommentTree or imported corpus.'}};
}
async function originalRowsForHit({$i,hit,maxRows=25}) { const imported=await findCommentsForPostAlias({$i,heichelId:hit.heichelId||'ikar',seriesId:hit.seriesId,postId:hit.postId,aliasId:hit.aliasId}); const map=new Map(imported.map(x=>[x.id,x])); const ordered=(hit.commentIds||[hit.firstCommentId,hit.lastCommentId]).filter(Boolean).map(id=>map.get(id)).filter(Boolean); const selected=commentsForSegment(ordered,hit.text||hit.previewEnglish||'',maxRows); return Promise.all(selected.map(async item=>{const rich=await get($i,richPaths.commentPath({heichelId:hit.heichelId||'ikar',postId:hit.postId,commentId:item.id}));const row=rich?slim(rich,hit):item;return {id:item.id,found:Boolean(row),source:rich?'commentTree':'imported',row,segmentMatch:item.segmentMatch,overlap:item.overlap,provenance:row||{id:item.id,...hit}};})); }
async function joinComments({$i,hits,maxRows}) { const out=[]; for(const hit of hits)out.push({...hit,comments:await originalRowsForHit({$i,hit:hit.row,maxRows})}); return out; }
process.once('exit',()=>{for(const db of cache.values()){try{db.pager?.close?.()}catch{}try{db.processLock?.release?.()}catch{}}});
module.exports={originalRowsForHit,joinComments,findCommentById,findCommentsForPostAlias,findAliasesForPost};
