#!/usr/bin/env node
// B"H
const {runChatOnce}=require('../runtime/chat-runner.js');const model=process.argv[2];const prompt=process.argv.slice(3).join(' ')||'Hello';if(!model){console.error('Usage: chat model.awtai-db "prompt"');process.exit(1);}try{console.log(JSON.stringify(runChatOnce(model,prompt),null,2));}catch(e){console.error(JSON.stringify({ok:false,error:String(e.stack||e)},null,2));process.exit(2);}
