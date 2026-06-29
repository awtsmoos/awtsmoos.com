// B"H
const {runChatOnce}=require('../runtime/chat-runner.js');const model=process.argv[2];if(!model){console.error('Usage: node test-chat-attempt.js model.awtai-db');process.exit(1);}try{console.log(JSON.stringify(runChatOnce(model,'B"H Hello, who are you?'),null,2));}catch(e){console.log(JSON.stringify({ok:false,honestFailure:String(e.message||e)},null,2));process.exit(0);}
