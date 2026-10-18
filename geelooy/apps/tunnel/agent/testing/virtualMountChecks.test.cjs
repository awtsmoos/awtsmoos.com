// B"H
const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const Mount=require('../tools/fs/virtualMountPath.js');
const Project=require('../tools/fs/projectValidation.js');
const {textStats}=require('../tools/fs/diagnostics.js');
test('Node syntax check uses real backing file from /workspace, not nonexistent host /workspace',async()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awts-virtual-check-'));
 try{fs.writeFileSync(path.join(root,'app.mjs'),'export const x=1;\n');
 const config={root,tools:{fsRead:true}};
 const ok=await Project.syntaxCheck(config,{path:'/workspace/app.mjs'});
 assert.equal(ok.ok,true,ok.stderr);assert.equal(ok.virtualMount,'workspace');
 const stat=await textStats(config,{path:'/workspace',maxEntries:10});
 assert.equal(stat.ok,true);assert.equal(stat.files,1);assert.equal(stat.virtualMount,'workspace');
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
test('unmounted paths never silently resolve as valid fake-SSH paths',()=>{
 const root=fs.mkdtempSync(path.join(os.tmpdir(),'awts-virtual-bounds-'));
 try{assert.equal(Mount.isVirtual('/workspace/foo'),true);assert.equal(Mount.isVirtual('/tmp/foo'),false);
 assert.throws(()=>Mount.resolve({root},'/workspace/../../etc/passwd'));
 }finally{fs.rmSync(root,{recursive:true,force:true})}
});
