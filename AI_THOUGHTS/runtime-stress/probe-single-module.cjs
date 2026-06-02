const fs=require('fs');
const { executeVmFiles, stripExports, parseImports }=require('../../geelooy/scripts/awtsmoos/MerkavaExecutor/merkava-binary/MerkavaVmFileExecutor.js');
(async()=>{
 const entry=process.argv[2];
 const source=fs.readFileSync(entry,'utf8');
 const stripped=stripExports(source,entry,{});
 fs.writeFileSync('AI_THOUGHTS/runtime-stress/single-transformed.js', stripped.code);
 console.log(JSON.stringify({entry,imports:parseImports(source,entry),exportNames:stripped.exportNames,codeLen:stripped.code.length,head:stripped.code.slice(0,300)},null,2));
 const r=await executeVmFiles({files:{[entry]:source},entry,globals:{},runtime:'browser'});
 console.log(JSON.stringify({ok:r.ok,exports:Object.keys(r.exports)},null,2));
})().catch(e=>{console.error(e.stack||e.message);process.exit(1);});
