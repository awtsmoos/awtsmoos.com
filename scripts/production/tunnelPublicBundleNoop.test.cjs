// B"H
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const test=require('node:test');
const worker=fs.readFileSync(path.join(__dirname,'remote-deploy-worker.sh'),'utf8');
test('canonical no-op deploy restores missing release ZIP without service restart',()=>{
 const start=worker.indexOf('if [ "$head_sha" = "$remote_sha" ]; then');
 const end=worker.indexOf('CANONICAL_DEPLOY_REACTIVATE',start);
 assert.ok(start>0&&end>start);
 const branch=worker.slice(start,end);
 assert.match(branch,/bundle\.readVerifiedCache\(\)/);
 assert.match(branch,/tunnel-bundle-preflight\.cjs/);
 assert.match(branch,/tunnel_bundle_preflight_failed/);
 assert.doesNotMatch(branch,/systemctl restart/);
});
