// B"H
const fs=require('fs');
const {decodeMode2App, OP}=require('../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2AppBinary.js');
const {readRef, readValue}=require('../../scripts/awtsmoos/MerkavaExecutor/merkava-binary/Mode2ValueCodec.js');
const buf=fs.readFileSync('dist/sample.merkava');
const app=decodeMode2App(buf); const r=app.body;
console.log(JSON.stringify({version:app.version,pool:app.pool,selectors:app.selectors,bodyLen:r.buffer.length},null,2));
const tc=r.varUint(); console.log('templates',tc);
for(let i=0;i<tc;i++){ readRef(r,app.pool); readRef(r,app.pool); const ac=r.varUint(); for(let j=0;j<ac;j++){readRef(r,app.pool); readValue(r,app.pool);} }
const nc=r.varUint(); console.log('nodeRecords',nc);
for(let i=0;i<nc;i++){
 const op=r.u8();
 if(op===OP.NODE){
  const tag=readRef(r,app.pool),id=readRef(r,app.pool),parent=readRef(r,app.pool),text=readValue(r,app.pool);
  const ac=r.varUint(); const attrs=[]; for(let j=0;j<ac;j++) attrs.push([readRef(r,app.pool),readValue(r,app.pool)]);
  console.log(JSON.stringify({op,tag,id,parent,text,attrs},null,2));
 } else console.log('node op',op);
}
const sc=r.varUint(); console.log('styles',sc);
for(let i=0;i<sc;i++){
 const op=r.u8(); console.log('style op',op);
 if(op===OP.STYLE_STREAM_BITS){const count=r.varUint(); for(let j=0;j<count;j++){r.varUint(); r.bytesWithLength();}}
 else if(op===OP.STYLE_BITS){r.varUint(); r.bytesWithLength();}
 else if(op===OP.STYLE){r.varUint(); const pc=r.varUint(); for(let p=0;p<pc;p++){readRef(r,app.pool); readValue(r,app.pool);}}
}
while(!r.done()){
 const op=r.u8(); console.log('program op',op,'offset',r.offset);
 if(op===OP.END) break;
 if(op===OP.JS){
  const kind=r.u8(); console.log('js kind',kind);
  if(kind===1){console.log({target:readRef(r,app.pool),value:readValue(r,app.pool)});}
  else if(kind===2){
    console.log({target:readRef(r,app.pool), viewport:[r.varUint(),r.varUint(),r.varUint(),r.varUint()], clearColor:[r.varUint(),r.varUint(),r.varUint(),r.varUint()], drawArrays:[r.varUint(),r.varUint()]});
  } else {
    console.log('legacy kind'); break;
  }
 } else if(op===OP.JS_BITS || op===OP.JS_SCOPE_BITS){r.bytesWithLength();}
 else break;
}
console.log('done',r.done(), 'offset', r.offset);
