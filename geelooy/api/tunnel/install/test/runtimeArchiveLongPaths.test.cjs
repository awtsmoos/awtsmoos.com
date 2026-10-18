// B"H
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process'),zlib=require('node:zlib');
const Tar=require('../tools/installerComponentTar.js');
const Runtime=require('../tools/runtimeBundles.js');
test('USTAR prefix preserves source names beyond 100 UTF-8 bytes',()=>{
 const name='geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/js-md2/runtime/Mode2RuntimeFeatureInventory.js';
 const prepared=Tar.prepareHeader(name,12);
 assert.equal(prepared.extensions.length,0);
 const leaf=prepared.header.toString('utf8',0,100).split('\0')[0];const prefix=prepared.header.toString('utf8',345,500).split('\0')[0];
 assert.equal(prefix+'/'+leaf,name);
});
test('POSIX PAX extension round-trips a 300-byte path with macOS or Linux tar',()=>{
 const name='geelooy/'+('deep-component/'.repeat(18))+'proof.txt';
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-pax-proof-'));
 try {const archive=path.join(dir,'test.tar');fs.writeFileSync(archive,Tar.buildTar([{name,data:Buffer.from('VERIFIED')}]));
 const listed=cp.spawnSync('tar',['-tf',archive],{encoding:'utf8',timeout:2000});assert.equal(listed.status,0,listed.stderr);assert.equal(listed.stdout.trim(),name);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
test('the complete Merkava runtime package is tar-readable with its canonical long paths',()=>{
 const built=Runtime.getBundle('merkava');assert(built.bytes>100000);
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-real-merkava-tar-'));
 try{const file=path.join(dir,'merkava.tar.gz');fs.writeFileSync(file,built.buffer);
 const listed=cp.spawnSync('tar',['-tzf',file],{encoding:'utf8',timeout:8000,maxBuffer:4*1024*1024});assert.equal(listed.status,0,listed.stderr);
 assert.equal(listed.stdout.trim().split('\n').length,built.files);
 assert.match(listed.stdout,/Mode2RuntimeFeatureInventory.js/);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
