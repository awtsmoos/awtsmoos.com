//B"H
//Boruch Hashem
//Blessed is He

import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const cleanup=require('../unix-other-installs-cleanup.cjs');
function fixture(){
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'awts-cleanup-home-'));
 const root=path.join(home,'.awtsmoos-tunnel');
 const old=path.join(home,'.awtsmoos','tunnel');
 const second=path.join(home,'.awtsmoos-tunnel-old');
 const foreign=path.join(home,'.awtsmoos-tunnel-foreign');
 const project=path.join(home,'important-project');
 for (const item of [root,old,second,foreign,project])fs.mkdirSync(item,{recursive:true});
 for(const item of [old,second,root])for(const name of ['main.js','awtsmoos-supervisor.sh','install-state.txt'])fs.writeFileSync(path.join(item,name),'B"H test');
 fs.writeFileSync(path.join(project,'index.js'),'must survive');
 fs.writeFileSync(path.join(foreign,'data.txt'),'must survive');
 return {home,root,old,second,foreign,project,cleanup(){fs.rmSync(home,{recursive:true,force:true})}};
}
test('default cleans multiple separately installed tunnel identities but keeps the verified active installation',()=>{
 const f=fixture();try{const x=cleanup.run({home:f.home,active:f.root});assert.equal(x.ok,true,JSON.stringify(x));assert.equal(x.checked,2);assert(!fs.existsSync(f.old));assert(!fs.existsSync(f.second));assert(fs.existsSync(f.root));assert(fs.existsSync(f.foreign));assert(fs.existsSync(f.project));}finally{f.cleanup()}
});
test('dry-run never removes old identity or credential files',()=>{
 const f=fixture();try{const x=cleanup.run({home:f.home,active:f.root,dryRun:true});assert.equal(x.ok,true);assert(fs.existsSync(f.old));assert(fs.existsSync(f.second));}finally{f.cleanup()}
});
test('reject dangerous active roots, unrelated folders and symlinked old installations',()=>{
 const f=fixture();try{assert.throws(()=>cleanup.run({home:f.home,active:f.home}),/invalid_active_root/);assert.equal(cleanup.exactRoot(f.project,f.root,f.home),false);const link=path.join(f.home,'.awtsmoos-tunnel-link');fs.symlinkSync(f.project,link);assert.equal(cleanup.exactRoot(link,f.root,f.home),false);}finally{f.cleanup()}
});
