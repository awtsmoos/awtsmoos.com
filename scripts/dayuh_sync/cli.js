#!/usr/bin/env node
// B"H
const { loadConfig, connection } = require('./config.js');
const { assertSafe } = require('./preflight.js');
const { SshAdapter } = require('./sshAdapter.js');
const { push, pull } = require('./sync.js');
function args(argv) {
  const out={command:argv[2]||'plan-push',config:'dayuh-sync.json',allowLive:false,deleteExtraneous:false};
  for(let i=3;i<argv.length;i++){const value=argv[i];if(value==='--config')out.config=argv[++i];else if(value==='--allow-live')out.allowLive=true;else if(value==='--delete')out.deleteExtraneous=true;else if(value==='--interval')out.interval=Number(argv[++i]);}
  return out;
}
function progress(event) { process.stderr.write(`${JSON.stringify(event)}\n`); }
async function runOnce(options, adapter) {
  const dryRun=options.command.startsWith('plan-');
  const direction=options.command.endsWith('pull')?'pull':'push';
  const shared={localRoot:options.config.localRoot,adapter,excludes:options.config.excludes,deleteExtraneous:options.deleteExtraneous||options.config.deleteExtraneous,dryRun,onProgress:progress};
  return direction==='pull'?pull(shared):push(shared);
}
async function main() {
  const options=args(process.argv);options.config=loadConfig(options.config);
  if(!['push','pull','plan-push','plan-pull','watch'].includes(options.command))throw new Error('Use push, pull, plan-push, plan-pull, or watch.');
  assertSafe(options.config.localRoot,{allowLive:options.allowLive});
  const adapter=await new SshAdapter(connection(options.config),options.config.remoteRoot,options.config.chunkBytes).init();
  try {
    if(options.command!=='watch'){console.log(JSON.stringify(await runOnce(options,adapter),null,2));return;}
    const interval=Math.max(5,options.interval||30)*1000;
    for(;;){try{console.log(JSON.stringify({...await push({localRoot:options.config.localRoot,adapter,excludes:options.config.excludes,deleteExtraneous:false,dryRun:false,onProgress:progress}),at:new Date().toISOString()},null,2));}catch(error){console.error(error.stack||error)}await new Promise(resolve=>setTimeout(resolve,interval));}
  } finally { await adapter.close(); }
}
main().catch(error=>{console.error(JSON.stringify({error:error.message,code:error.code,locks:error.locks},null,2));process.exit(1)});
