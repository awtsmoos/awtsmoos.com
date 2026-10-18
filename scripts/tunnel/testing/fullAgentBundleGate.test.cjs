// B"H
// Boruch Hashem
// Blessed is He
const test=require('node:test');
const assert=require('node:assert/strict');
const path=require('node:path');
const crypto=require('node:crypto');
const repo=path.resolve(__dirname,'../../..');
const Bundle=require('../../../geelooy/api/tunnel/install/tools/zipBundle.js');
const Manifest=require('../../../geelooy/apps/tunnel/agent/release/manifestDocument.js');
const Sources=require('../../../geelooy/apps/tunnel/agent/release/sourcePaths.js');
const fs=require('node:fs');
test('every indexed production dependency is in manifest and the real ZIP can build',()=>{
 const roots=Sources.resolveRoots(repo);
 const manifest=Manifest.readCurrent(path.join(roots.agentRoot,'manifest.txt'));
 const coverage=require('../../../geelooy/apps/tunnel/agent/release/runtimeFiles.js').assertManifestCoverage(manifest.files,roots);
 assert.equal(coverage.ok,true);
 const bundle=Bundle.buildAgentBundle(repo);
 assert.ok(bundle.bytes>1000000);
 assert.ok(bundle.files>=coverage.files);
 assert.equal(crypto.createHash('sha256').update(bundle.buffer).digest('hex'),bundle.sha256);
 assert.match(bundle.version,/^\d+\.\d+\.\d+$/);
});
