// B"H
import assert from 'node:assert/strict';
import { actionCatalog, commandRunTemplate, findAction } from '../../os/tunnel/actionCatalog.js';
import { buildTunnelCommandRequest, tunnelVirtualList, tunnelVirtualRead } from '../../os/tunnel/virtualTunnelFs.js';
import { tunnelAdapter } from '../../os/vfs/tunnelAdapter.js';

const actions = actionCatalog();
assert(actions.some(item => item.action === 'commandRun'));
assert.equal(findAction('commandRun').template.action, 'commandRun');
assert.equal(commandRunTemplate('echo hi').requestAction, 'commandRun');

const root = tunnelVirtualList('awtsmoos://tunnels');
assert(root.some(item => item.name === 'actions.json'));
assert(JSON.parse(tunnelVirtualRead('awtsmoos://tunnels/actions.json')).actions.length >= 10);
assert.equal(JSON.parse(tunnelVirtualRead('awtsmoos://tunnels/actions/commandRun.json')).action, 'commandRun');

const request = buildTunnelCommandRequest({ command:'echo hi', cwd:'/tmp', tunnelName:'awt-test', allowNative:true });
assert.equal(request.payload.action, 'commandRun');
assert.equal(request.payload.requestAction, 'commandRun');
assert.equal(request.requiresNativeTunnel, true);

const adapter = tunnelAdapter({});
const listed = await adapter.list('awtsmoos://tunnels');
assert(listed.some(item => item.name === 'actions.json'));
const read = JSON.parse(await adapter.read('awtsmoos://tunnels/actions.json'));
assert(read.actions.some(item => item.action === 'commandRun'));
const write = await adapter.write('awtsmoos://tunnels/run-command.request.json', JSON.stringify({ command:'echo hi', cwd:'/tmp', allowNative:true }));
assert.equal(write.payload.action, 'commandRun');
console.log('tunnel VFS exposes command catalog and native command request surface');
