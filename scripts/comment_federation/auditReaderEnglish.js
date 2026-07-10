#!/usr/bin/env node
// B"H
const http = require('http');
const DB = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosDB');
const awts = require('../../ayzarim/DosDB/awtsmoosBinary/awtsmoosBinaryJSON');
function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.get({ host:'127.0.0.1', port:8080, path, timeout:120000 }, res => {
      const chunks=[]; res.on('data', d=>chunks.push(d));
      res.on('end',()=>{try{resolve({status:res.statusCode,json:JSON.parse(Buffer.concat(chunks))})}catch(e){reject(e)}});
    });
    req.on('timeout',()=>req.destroy(new Error('timeout'))); req.on('error',reject);
  });
}
function open(file) { const db=new DB(file,{readOnly:true,readonly:true,wal:false,processLockMode:'shared',lockMode:'shared'}); db.open(); db.fs.ready(); return db; }
function read(db,p) { const s=db.fs.stat(p); return awts.deserializeBinary(db.fs.readRange(p,0,s.size)); }
function targets() {
  const db=open('../../dayuhChadash/socialPacked/social.heichel.ikar.posts.fs.awtsdb'), out=[];
  try {
    for(const inode of Object.values(db.__fs3Manifest.inodes||{})) {
      const m=inode?.path?.match(/^\/social\/heichelos\/ikar\/series\/([^/]+)\/posts(?:\.awtsmoosJSON)?$/);
      if(!m || !(/BH-seferHamaamarimMeluket-/.test(m[1]) || /^seferHaSichos\d+$/.test(m[1]))) continue;
      const bundle=read(db,inode.path);
      for(const postId of Object.keys(bundle).filter(k=>k!=='$awtsmoosObjectShape')) out.push({family:m[1].startsWith('sefer')?'sefer':'meluket',seriesId:m[1],postId,sections:bundle[postId]?.dayuh?.sections?.length||bundle[postId]?.sections?.length||0,title:bundle[postId]?.title});
    }
  } finally { try{db.pager?.close?.();db.processLock?.release?.()}catch{} }
  return out;
}
async function auditOne(t, stats) {
  const fields={heichelId:'ikar',seriesId:t.seriesId,postId:t.postId};
  const aliasResponse=await get(`/api/social/search/rag/post-comments?${new URLSearchParams(fields)}`);
  const aliases=(aliasResponse.json?.success||[]).filter(alias=>typeof alias==='string'&&alias);
  const rows=[];
  for(const alias of aliases){const response=await get(`/api/social/search/rag/post-comments?${new URLSearchParams({...fields,aliasId:alias})}`);rows.push(...(response.json?.success||[]));stats[t.family].aliases[alias]=(stats[t.family].aliases[alias]||0)+1;}
  const family=stats[t.family]; family.posts++; family.rows+=rows.length;
  for(const row of rows){if(!String(row?.content||'').trim())family.blank++;const i=Number(row?.verseSection);if(Number.isInteger(i)&&t.sections&&i>=t.sections)family.outOfBounds++;}
  if(rows.length) family.ok++; else {family.missing++;stats.bad.push({...t,aliases,status:aliasResponse.status});}
}
async function main() {
  const list=targets(), stats={meluket:{posts:0,ok:0,missing:0,rows:0,blank:0,outOfBounds:0,aliases:{}},sefer:{posts:0,ok:0,missing:0,rows:0,blank:0,outOfBounds:0,aliases:{}},bad:[]};
  for(let index=0;index<list.length;index++){await auditOne(list[index],stats);if((index+1)%25===0)process.stderr.write(`checked ${index+1}/${list.length}\n`);}
  console.log(JSON.stringify({targets:list.length,...stats},null,2));
  if(stats.meluket.missing||stats.sefer.missing||stats.meluket.blank||stats.sefer.blank||stats.meluket.outOfBounds||stats.sefer.outOfBounds) process.exitCode=1;
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)});
