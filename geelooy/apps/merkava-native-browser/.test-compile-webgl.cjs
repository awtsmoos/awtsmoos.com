// B"H
const fs=require('fs');
const { compileSourceFilesToMode2 } = require('../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/SourceAppCompiler.js');
const { decodeMode2App, OP } = require('../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2AppBinary.js');
const { readRef, readValue } = require('../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2ValueCodec.js');
(async()=>{
 const files={'/index.html':fs.readFileSync('samples/frontend.html','utf8'),'/app.js':fs.readFileSync('samples/app.js','utf8')};
 const b=await compileSourceFilesToMode2({files,entry:'/index.html'}); fs.writeFileSync('dist/test-webgl.merkava',b);
 const app=decodeMode2App(b), r=app.body;
 r.varUint(); const nc=r.varUint();
 for(let i=0;i<nc;i++){ const op=r.u8(); if(op!==OP.NODE) throw new Error('bad node'); readRef(r,app.pool); readRef(r,app.pool); readRef(r,app.pool); readValue(r,app.pool); const ac=r.varUint(); for(let j=0;j<ac;j++){ readRef(r,app.pool); readValue(r,app.pool); } }
 const sc=r.varUint(); for(let i=0;i<sc;i++){ console.log('style?',r.u8()); }
 const op=r.u8(); const kind=op===OP.JS ? r.u8() : -1; console.log(JSON.stringify({bytes:b.length,pool:app.pool,op,kind},null,2));
})();
