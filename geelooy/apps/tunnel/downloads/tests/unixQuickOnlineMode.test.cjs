// B"H
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const http=require('node:http');
const os=require('node:os');
const path=require('node:path');
const {spawn}=require('node:child_process');
const test=require('node:test');
const entry=path.resolve(__dirname,'../unix.sh');

async function fixture(fn){
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awt-tunnel-quick-'));
 const server=http.createServer((req,res)=>{
  res.setHeader('content-type','application/json');
  res.end(JSON.stringify({ok:true,relayReady:true,state:'registered',connectionAlive:true,parentAlive:true,
    runtimeVersion:server.version||'1.2.3',receiptAgeMs:2000}));
 });
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 try {
  fs.mkdirSync(path.join(root,'scripts'));
  fs.writeFileSync(path.join(root,'main.js'),'// B"H\n');
  const manifest='B"H\n1.2.3\nmain.js\n';
  fs.writeFileSync(path.join(root,'installed-manifest.txt'),manifest);
  fs.writeFileSync(path.join(root,'install-state.txt'),'1.2.3\n');
  fs.writeFileSync(path.join(root,'install-manifest.sha256'),crypto.createHash('sha256').update(manifest).digest('hex')+'\n');
  fs.writeFileSync(path.join(root,'scripts/recovery-control.cjs'),"console.log(JSON.stringify({ok:true}));\n");
  fs.writeFileSync(path.join(root,'config.json'),JSON.stringify({localApi:{port:server.address().port}}));
  await fn({root,server});
 } finally {await new Promise(resolve=>server.close(resolve));fs.rmSync(root,{recursive:true,force:true})}
}
function run(root,args){return new Promise((resolve,reject)=>{
 const p=spawn('bash',[entry,...args],{env:{...process.env,AWTSMOOS_INSTALL_ROOT:root,TERM:'dumb',NO_COLOR:'1'},stdio:['ignore','pipe','pipe']});
 let out='',err='';p.stdout.on('data',x=>out+=x);p.stderr.on('data',x=>err+=x);
 p.on('error',reject);p.on('exit',code=>resolve({code,out,err}));
})}
test('quick mode confirms valid installed seal and live relay without an installer download',async()=>{
 await fixture(async({root})=>{
  const before=fs.readFileSync(path.join(root,'main.js'));
  const result=await run(root,['--quick','--yes']);
  assert.equal(result.code,0,result.err);
  assert.match(result.out,/TUNNEL ONLINE/);
  assert.match(result.out,/does not check for updates/);
  assert.deepEqual(fs.readFileSync(path.join(root,'main.js')),before);
 });
});
test('quick mode does not claim success on incorrect relay version',async()=>{
 await fixture(async({root,server})=>{
  server.version='wrong';
  const result=await run(root,['--quick','--yes']);
  assert.notEqual(result.code,0);
  assert.match(result.err,/no current authenticated registration/);
 });
});
test('quick mode refuses destructive or forced replacement combinations',async()=>{
 await fixture(async({root})=>{
  const result=await run(root,['--quick','--full']);
  assert.equal(result.code,64);
  assert.match(result.err,/cannot be combined/);
 });
});
test('quick mode rejects a manipulated manifest even with a live local API',async()=>{
 await fixture(async({root})=>{
  fs.appendFileSync(path.join(root,'installed-manifest.txt'),'tampered\n');
  const result=await run(root,['--quick']);
  assert.notEqual(result.code,0);
  assert.match(result.err,/seal does not match/);
 });
});
