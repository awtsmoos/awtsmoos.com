#!/usr/bin/env node
// B"H
const fs=require('fs');const path=require('path');const {convertGgufBytes}=require('../awtai/converter.js');const input=process.argv[2];if(!input){console.error("Usage: convert input.gguf [out.awtai-db]");process.exit(1);}const out=process.argv[3]||input.replace(/\.gguf$/i,'')+'.awtai-db';const r=convertGgufBytes(fs.readFileSync(input),{name:path.basename(input)});fs.writeFileSync(out,Buffer.from(r.bytes));console.log(JSON.stringify({output:out,tensors:r.manifest.tensors.length,packets:r.manifest.packets.length,bytes:r.bytes.length},null,2));
