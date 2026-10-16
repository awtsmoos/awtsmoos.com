// B"H
const assert = require('node:assert/strict');
const test = require('node:test');
const Sync = require('./commandActionSync.js');
const Async = require('./asyncTaskPolicy.js');
const Job = require('../commandJob/context.js');
const AsyncActions = require('./asyncTaskActions.js');

test('untrusted request flags cannot override device command disablement', async () => {
  const config = { allowCommands:false,root:process.cwd() };
  for (const payload of [{allowCommands:true},{allowCommands:'true'},{allowCommands:1},{allowCommands:'yes'}]) {
    assert.equal(Async.allowed(config,payload),false);
    assert.equal(Job.allowed(config,payload),false);
    const sync=await Sync.runCommand(config,{...payload,command:'echo bypass'},'commandRun');
    assert.equal(sync.ok,false);
    assert.equal(sync.error,'commands_disabled');
    const async=await AsyncActions.start(config,{...payload,command:'node',args:['-v']});
    assert.equal(async.ok,false);
    assert.equal(async.error,'commands_disabled');
  }
  assert.equal(Async.allowed({allowCommands:true},{}),true);
  assert.equal(Job.allowed({allowCommands:true},{}),true);
});
