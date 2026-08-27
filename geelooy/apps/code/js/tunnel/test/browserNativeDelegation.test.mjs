// B"H
import assert from 'node:assert/strict';
import { BrowserCommandAdapter } from '../BrowserCommandAdapter.js';
import { nativeCommandPayload } from '../browser-native-command.js';

assert.deepEqual(nativeCommandPayload('echo hi', '/tmp', { tunnelName:'awt-test' }).action, 'commandRun');
let sent = null;
const adapter = new BrowserCommandAdapter({ fs:{ call(){ throw new Error('should not use browser fs when native delegation is allowed'); } } });
const result = await adapter.run({
  command:'echo hi', cwd:'/tmp', allowNative:true, tunnelName:'awt-test',
  nativeTunnel:{ async send(payload){ sent = payload; return { ok:true, action:payload.action, requestAction:payload.requestAction, actualAction:payload.actualAction, delegated:true, payload }; } }
});
assert.equal(sent.action, 'commandRun');
assert.equal(sent.requestAction, 'commandRun');
assert.equal(sent.responseMode, 'compact');
assert.equal(result.action, 'commandRun');
assert.equal(result.delegated, true);
console.log('browser command adapter delegates native commandRun through tunnel transport');
