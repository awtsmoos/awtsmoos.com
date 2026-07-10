#!/usr/bin/env node
// B"H
const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { LocalAdapter } = require('../localAdapter.js');
const { push, pull } = require('../sync.js');
function write(root, relative, content) { const file=path.join(root,relative);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,content); }
async function main() {
  const base=fs.mkdtempSync(path.join(os.tmpdir(),'awtsmoos-dayuh-sync-'));
  const local=path.join(base,'local'), remote=path.join(base,'remote');fs.mkdirSync(local);fs.mkdirSync(remote);
  write(local,'a.txt','one');write(local,'nested/b.txt','two');write(local,'skip.wal','transient');
  const adapter=new LocalAdapter(remote), excludes=['*.wal','.awtsmoos-dayuh-sync-manifest.json'];
  const first=await push({localRoot:local,adapter,excludes});assert.deepEqual(first.upload,['a.txt','nested/b.txt']);assert.equal(fs.existsSync(path.join(remote,'skip.wal')),false);
  const second=await push({localRoot:local,adapter,excludes});assert.equal(second.upload.length,0);assert.equal(second.unchanged,2);
  write(local,'a.txt','changed');const third=await push({localRoot:local,adapter,excludes});assert.deepEqual(third.upload,['a.txt']);assert.equal(fs.readFileSync(path.join(remote,'a.txt'),'utf8'),'changed');
  write(remote,'nested/b.txt','remote-change');const manifest=await adapter.readJson('.awtsmoos-dayuh-sync-manifest.json');const crypto=require('crypto');manifest.files['nested/b.txt']={size:13,mtimeMs:Date.now(),sha256:crypto.createHash('sha256').update('remote-change').digest('hex')};await adapter.writeJson('.awtsmoos-dayuh-sync-manifest.json',manifest);
  const pulled=await pull({localRoot:local,adapter,excludes});assert.deepEqual(pulled.download,['nested/b.txt']);assert.equal(fs.readFileSync(path.join(local,'nested/b.txt'),'utf8'),'remote-change');
  fs.rmSync(base,{recursive:true,force:true});console.log('B"H dayuh sync isolated tests passed');
}
main().catch(error=>{console.error(error.stack||error);process.exit(1)});
