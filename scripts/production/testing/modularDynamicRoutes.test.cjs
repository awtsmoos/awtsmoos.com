// B"H
const test=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path'),cp=require('node:child_process');
const script=path.resolve(__dirname,'../ensure-dynamic-platform-routes.sh');
const root=path.resolve(__dirname,'../../..');
function setup(){const dir=fs.mkdtempSync(path.join(os.tmpdir(),'awts-nginx-modular-'));
 const vhost=path.join(dir,'vhost.conf');const snippets=['torah-pages','application-pages'];
 const includes=snippets.map(name=>{const dest=path.join(dir,name+'.conf');
 fs.copyFileSync(path.join(root,'infrastructure/nginx/awtsmoos.com/snippets',name+'.conf'),dest);
 return `include ${dest};`;});
 fs.writeFileSync(vhost,`server {\n${includes.join('\n')}\n}\n`);
 return {dir,vhost,files:snippets.map(n=>path.join(dir,n+'.conf'))};}
function execute(vhost){return cp.spawnSync('bash',[script],{encoding:'utf8',timeout:3000,
 env:{...process.env,AWTSMOOS_NGINX_PLATFORM_PATH:vhost,AWTSMOOS_NGINX_TEST_ONLY:'1'}})}
test('modular routes in included snippets need no root-location insertion',()=>{
 const x=setup();try{const original=fs.readFileSync(x.vhost);const r=execute(x.vhost);
 assert.equal(r.status,0,r.stderr);assert.deepEqual(fs.readFileSync(x.vhost),original);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
test('missing modular route fails without rewriting another agent’s config',()=>{
 const x=setup();try{fs.writeFileSync(x.files[0],'# missing Torah routes\n');
 const original=fs.readFileSync(x.vhost);const r=execute(x.vhost);
 assert.notEqual(r.status,0);assert.match(r.stderr,/modular_dynamic_routes_missing/);
 assert.deepEqual(fs.readFileSync(x.vhost),original);
 }finally{fs.rmSync(x.dir,{recursive:true,force:true})}
});
