// B"H
// Boruch Hashem
// Blessed is He
const assert = require('node:assert/strict');
const test = require('node:test');
const Startup = require('../lib/runtime/main-startup.js');

function dependencies(connectCalls) {
  const config = { tunnelName:'isolated-probe', root:'/tmp', wsUrl:'wss://example.test', deviceStateRoot:'/tmp', inlineLimitBytes:1024, localApiPort:47474 };
  return {
    AGENT_VERSION:'test', config:{ ROOT:'/tmp' },
    Limits:{ MAX_INFLIGHT:10, MAX_QUEUE:10, LANE_LIMITS:{} },
    log(){}, loadConfig(){ return config; },
    ProjectRootHealth:{ probeProjectRoot(){ return {ok:false,reason:'test-no-project-root'}; } },
    startLocalApiServer(){ return {listening:true}; },
    Boot:{ start(){ return false; } },
    Updates:{ scheduleSelfUpdate(){ return false; } },
    DeviceIdentity:{ load(){ return {ok:true, state:'paired'}; }, publicStatus(){ return {state:'paired'}; } },
    FsExecutor:{ warm(){ return {ok:true}; } },
    connection:{ connect(){ connectCalls.push('production-relay-dial'); return {connected:true}; } },
    WebsiteMissionRecovery:{ recover(){ return []; } },
    shouldOpenControl(){ return false; }
  };
}

async function withMode(mode, fn) {
  const prior = process.env.AWTSMOOS_REGISTRATION_MODE;
  try {
    if (mode) process.env.AWTSMOOS_REGISTRATION_MODE = mode;
    else delete process.env.AWTSMOOS_REGISTRATION_MODE;
    return await fn();
  } finally {
    if (prior === undefined) delete process.env.AWTSMOOS_REGISTRATION_MODE;
    else process.env.AWTSMOOS_REGISTRATION_MODE = prior;
  }
}

test('non-owning candidate never registers synthetic identity against production relay', async () => {
  await withMode('candidate-probe', async () => {
    const calls=[];
    const result=await Startup.createStartupRuntime(dependencies(calls)).main();
    assert.equal(result.localApiStarted,true);
    assert.equal(result.socketStarted,false);
    assert.deepEqual(calls, []);
  });
});

test('promoted owning runtime still connects to production relay', async () => {
  await withMode(null, async () => {
    const calls=[];
    const result=await Startup.createStartupRuntime(dependencies(calls)).main();
    assert.equal(result.socketStarted,true);
    assert.deepEqual(calls,['production-relay-dial']);
  });
});
