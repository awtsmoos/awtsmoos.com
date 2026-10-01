// B"H
const fs = require('fs');
const os = require('os');
const path = require('path');
const AwtsmoosDB = require('../index.js');
function assert(v,m){if(!v)throw new Error(m)}
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-fs3-cache-'));
const file=path.join(dir,'budget.awtsdb');
let db;
try {
  db=new AwtsmoosDB(file,{virtualFsCacheBytes:256*1024,reuseFreedSpace:false}); db.open();
  for(let i=0;i<220;i++) db.fs.write('/f'+i+'.txt',Buffer.from('x'.repeat(256)));
  db.close(); db=null;
  db=new AwtsmoosDB(file,{readOnly:true,virtualFsCacheBytes:256*1024}); db.open();
  for(let i=0;i<220;i++) db.fs.stat('/f'+i+'.txt');
  assert(db.__fs3 && db.__fs3.cacheBytes <= 256*1024,'FS3 cache exceeded byte budget: '+db.__fs3?.cacheBytes);
  console.log('B"H fs3_cache_budget_test PASS bytes='+db.__fs3.cacheBytes+' records='+db.__fs3.cache.size);
} finally { if(db)db.close(); fs.rmSync(dir,{recursive:true,force:true}); }
