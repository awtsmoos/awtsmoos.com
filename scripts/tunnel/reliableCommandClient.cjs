// B"H
// Boruch Hashem
// Blessed is He
'use strict';
const { randomUUID } = require('node:crypto');
/** The Awtsmoos keeps one command's identity through receipts and terminal truth. */
async function runCommand(api, command, options = {}) {
 const timeoutMs = options.timeoutMs || 60000;
 const deadline = Date.now() + timeoutMs;
 const owner = options.logicalAgentId || 'awtsmoos-client-' + randomUUID();
 const pause = options.pause || (ms => new Promise(resolve => setTimeout(resolve, ms)));
 const check = () => { if (Date.now() >= deadline) throw Error('command_observation_deadline; execution may still be running'); };
 const call = async payload => {
  check();
  let result = await api({ ...payload, logicalAgentId: owner }, Math.max(1, deadline-Date.now()));
  while (result.pending === true || (result.action === 'tunnelRequestPending' && result.terminal !== true && result.ok !== false)) {
   check();
   const receipt = result.observeWith || result.retryPayload;
   if (!receipt || !receipt.controlRequestId) throw Error('pending_receipt_missing_observation_identity');
   await pause(Math.min(1000, Math.max(25, Number(result.retryAfterMs) || 100)));
   check();
   // Copy the complete receipt; never submit a replacement command.
   result = await api({ ...receipt, action:'retryAction', logicalAgentId:owner }, Math.max(1,deadline-Date.now()));
  }
  if (result.error || result.ok === false) throw Error(result.error || 'tunnel_action_failed');
  return result;
 };
 let result = await call({ action: options.action || 'commandRun', command,
  cwd:options.cwd, timeoutMs, clientRequestId:randomUUID(), nonce:randomUUID() });
 const jobId = result.jobId;
 if (!jobId) {
  if (!Number.isInteger(result.exitCode)) throw Error('command_receipt_has_neither_job_nor_terminal_exit');
  return { ...result, stdout: text(result.stdout), stderr:text(result.stderr) };
 }
 while (result.done !== true && result.terminal !== true &&
   !['completed','failed','cancelled','timed_out','timeout','error'].includes(result.status)) {
  result = await call({ action:'commandWait', jobId, inlineOutput:false,
   waitTimeoutMs:Math.min(5000, Math.max(1,deadline-Date.now())), pollIntervalMs:100 });
  if (result.jobId && result.jobId !== jobId) throw Error('foreign_job_response');
  if (result.done !== true) await pause(50);
 }
 if (!Number.isInteger(result.exitCode)) throw Error('terminal_command_missing_exit_code');
 const output = {};
 for (const stream of ['stdout','stderr']) {
  let cursor=0, content='';
  while (true) {
   const page = await call({action:'commandJobOutputPage',jobId,stream,offsetChars:cursor,maxChars:60000});
   if (page.jobId && page.jobId !== jobId) throw Error('foreign_output_job');
   if (page.outputPartial || page.fullOutputAvailable === false) throw Error('command_output_partial; full output unavailable');
   if (page.writeDrainPending || page.outputSnapshotComplete === false) {
    await pause(100); continue;
   }
   content += text(page.content);
   if (!page.hasNextPage) break;
   const next = Number(page.nextOffsetChars);
   if (!Number.isInteger(next) || next <= cursor) throw Error('output_cursor_did_not_advance');
   cursor = next;
  }
  output[stream]=content;
 }
 return {...result,...output,jobId};
}
function text(value) { return typeof value === 'string' ? value : String(value?.content || ''); }
/** HTTPS bearer authentication stays outside the Awtsmoos source and logs. */
function httpApi(endpoint, token) {
 const url = new URL(endpoint);
 if (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['127.0.0.1','localhost'].includes(url.hostname)))
  throw Error('https_required');
 if (url.protocol === 'https:' && !token) throw Error('AWTSMOOS_TUNNEL_TOKEN_required');
 return async (payload, remainingMs) => {
  const response = await fetch(url, {method:'POST',headers:{'Content-Type':'application/json',
   ...(token ? {Authorization:'Bearer '+token}: {})},body:JSON.stringify(payload),
   signal:AbortSignal.timeout(Math.min(remainingMs,20000))});
  const result = await response.json();
  if (!response.ok && !result.error) throw Error('tunnel_http_'+response.status);
  return result;
 };
}
module.exports={runCommand,httpApi};
if (require.main === module) {
 const [endpoint, command, cwd] = process.argv.slice(2);
 if (!endpoint || !command) { console.error('Usage: node reliableCommandClient.cjs HTTPS_FS_ENDPOINT COMMAND [CWD]');process.exitCode=2; }
 else runCommand(httpApi(endpoint,process.env.AWTSMOOS_TUNNEL_TOKEN),command,{cwd,
  logicalAgentId:process.env.AWTSMOOS_AGENT_ID}).then(result=>{
   process.stdout.write(result.stdout);process.stderr.write(result.stderr);
   process.exitCode=result.exitCode >=0 && result.exitCode <=255 ? result.exitCode : 2;
  }).catch(error=>{console.error(error.message);process.exitCode=2;});
}
