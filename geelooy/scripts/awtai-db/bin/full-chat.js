#!/usr/bin/env node
// B"H
const {runOneTokenFull}=require('../runtime/full-runner.js');const model=process.argv[2];const prompt=process.argv.slice(3).join(' ')||'Hello';if(!model){console.error('Usage: full-chat model.awtai-db "prompt"');process.exit(1);}try{console.log(JSON.stringify(runOneTokenFull(model,prompt),null,2));}catch(e){console.error(JSON.stringify({ok:false,error:String(e.stack||e)},null,2));process.exit(2);}
