// B"H
'use strict';
const assert=require('assert'),fs=require('fs'),os=require('os'),path=require('path');
const AwtsmoosDB=require('../index.js');
const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-db-budget-')); const file=path.join(dir,'budget.awtsdb'); let db;
try {
  db=new AwtsmoosDB(file,{virtualFsCompression:false}); db.open();
  const body=Buffer.alloc(8*1024*1024,7); db.fs.write('/big',body); db.close(); db=null;
  db=new AwtsmoosDB(file,{virtualFsCompression:false}); db.open();
  const started=Date.now(); db.fs.append('/big',Buffer.from('END')); const appendMs=Date.now()-started;
  db.fs.writeRange('/big',4*1024*1024,Buffer.from('BH'));
  const stat=db.fs.stat('/big');
  assert.strictEqual(stat.size,8*1024*1024+3);
  assert.strictEqual(db.fs.readRange('/big',stat.size-3,3).toString(),'END');
  assert.strictEqual(db.fs.readRange('/big',4*1024*1024,2).toString(),'BH');
  assert(db.pager.memoryBytes()<=8*1024*1024,'pager exceeded 8 MiB cache budget');
  assert(appendMs<500,'reserved-capacity append regressed: '+appendMs+'ms');
  console.log('B"H disk_native_memory_budget_test PASS appendMs='+appendMs+' pagerBytes='+db.pager.memoryBytes());
} finally { if(db)db.close(); fs.rmSync(dir,{recursive:true,force:true}); }
