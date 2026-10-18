// B"H
const assert=require('node:assert/strict'),test=require('node:test');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Bundle=require('../tools/zipBundle.js');
const SourcePaths=require('../../../../apps/tunnel/agent/release/sourcePaths.js');
const crypto=require('node:crypto');
const hash=x=>crypto.createHash('sha256').update(x).digest('hex');
test('canonical preflight bytes are served without rebuilding or changing source hashes',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awts-prebuilt-zip-'));
 try{
  const source=SourcePaths.resolveRoots();const manifest=fs.readFileSync(path.join(source.agentRoot,'manifest.txt'));
  const buffer=Buffer.from('TEST_ZIP_BYTES');
  const sealed={buffer,sha256:hash(buffer),manifestSha256:hash(manifest),version:'1.0.681',files:3053,bytes:buffer.length,releaseSourceSha:'a'.repeat(40)};
  Bundle.writeVerifiedCache(sealed,root);
  assert.deepEqual(Bundle.readVerifiedCache(root).buffer,buffer);
  assert.equal(Bundle.readVerifiedCache(root).releaseSourceSha,sealed.releaseSourceSha);
  fs.writeFileSync(path.join(root,'agent.zip'),'CORRUPTED');
  assert.equal(Bundle.readVerifiedCache(root),null);
 }finally{fs.rmSync(root,{recursive:true,force:true});}
});
