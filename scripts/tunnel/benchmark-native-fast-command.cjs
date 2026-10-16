// B"H
// Boruch Hashem
// Blessed is He

const { performance } = require('node:perf_hooks');
const { buildActions } = require('../../geelooy/apps/tunnel/agent/tools/fs/actions.js');
const path = require('node:path');

/** Local native executor benchmark, not a measurement of network or AI API latency. */
const cwd = path.resolve(process.argv[2] || process.cwd());
const iterations = Math.max(1, Math.min(100, Number(process.env.AWTS_FAST_BENCH_ITERATIONS || 20)));
const commands = ['pwd','whoami','uname -a','git status --short','git rev-parse HEAD','node --version'];
const config = { root: cwd, allowCommands: true, command: { enabled:true }, tools:{command:true} };
const percentile = (sorted, pct) => sorted[Math.min(sorted.length-1,Math.max(0,Math.ceil(pct*sorted.length)-1))];

(async () => {
  const report = { kind:'local-native-executor', note:'Does not include server routing or network RTT.', cwd, iterations, results:[] };
  for (const command of commands) {
    const measurements=[];
    let finalResult;
    for (let i=0;i<iterations;i++) {
      const start=performance.now();
      const payload={ action:'commandRun', command, cwd, requestId:`benchmark-${process.pid}-${i}`, logicalAgentId:'benchmark-local' };
      const result=await buildActions(config,payload,null).commandRun();
      const ms=performance.now()-start;
      if (!result?.ok || result.mode !== 'sync_command' || result.jobId || Number(result.exitCode)!==0) {
        throw new Error(`fast_benchmark_contract_failed:${command}:${JSON.stringify({ok:result?.ok,error:result?.error,mode:result?.mode})}`);
      }
      measurements.push(Number(ms.toFixed(2)));
      finalResult=result;
    }
    measurements.sort((a,b)=>a-b);
    report.results.push({ command, minMs:measurements[0], p50Ms:percentile(measurements,.5), p90Ms:percentile(measurements,.9), p95Ms:percentile(measurements,.95), maxMs:measurements.at(-1), outputChars:String(finalResult.stdout||'').length, mode:finalResult.mode });
  }
  console.log(JSON.stringify(report,null,2));
})().catch(error=>{console.error(error.stack||error);process.exitCode=1});
