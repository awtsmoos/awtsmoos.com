// B"H
import assert from 'assert';
import { CODE_BROWSER_TUNNEL_VERSION, codeBrowserRegistrationPacket, codeBrowserTunnelTools } from '../browser-agent-packets.js';

const fsActions = ['list', 'read', 'write', 'tree'];
const commandActions = ['commandRun', 'shellCommand'];
const previewActions = ['open', 'reload'];

const tools = codeBrowserTunnelTools({ fsActions, commandActions, previewActions });
assert.strictEqual(tools.command, 'merkava-virtual-or-remote');
assert.strictEqual(tools.chrome, false);
assert.strictEqual(tools.receiptStore, true);
assert.deepStrictEqual(tools.fsAdvanced, fsActions);
assert.deepStrictEqual(tools.commandActions, commandActions);
assert.deepStrictEqual(tools.previewControl, previewActions);

const packet = codeBrowserRegistrationPacket({ tunnelName: 'awt-browser-code-test', fsActions, commandActions, previewActions, userAgent: 'test-agent' });
assert.strictEqual(packet.type, 'TUNNEL_REGISTER');
assert.strictEqual(packet.protocolVersion, 'awtsmoos-tunnel-v2');
assert.strictEqual(packet.kind, 'browser-code-vessel');
assert.strictEqual(packet.tunnelName, 'awt-browser-code-test');
assert.strictEqual(packet.vessel, 'awtsmoos-code');
assert.strictEqual(packet.vesselType, 'awtsmoos-code');
assert.strictEqual(packet.deviceName, 'Awtsmoos Code');
assert.strictEqual(packet.root, 'awtsmoos://code');
assert.strictEqual(packet.workspaceId, 'browser-workspace');
assert.strictEqual(packet.browserAgent, true);
assert.strictEqual(packet.allowWrite, true);
assert.strictEqual(packet.allowSecrets, false);
assert.strictEqual(packet.allowCommands, 'limited');
assert.strictEqual(packet.agentVersion, CODE_BROWSER_TUNNEL_VERSION);
assert.strictEqual(packet.capabilities.commandRun, 'merkava-virtual-or-remote');
assert.strictEqual(packet.capabilities.nodeScript, 'merkava-simulated');
assert.strictEqual(packet.capabilities.missionAware, true);
assert.strictEqual(packet.capabilities.receiptStore, true);
assert.strictEqual(packet.capabilities.correlationSafe, true);
assert.deepStrictEqual(packet.capabilities.commandModes, ['merkava-virtual', 'native-delegated', 'unsupported']);
assert.deepStrictEqual(packet.capabilities.fsActions, fsActions);
assert.deepStrictEqual(packet.capabilities.previewControl, previewActions);
assert.strictEqual(packet.command.mode, 'merkava-virtual-or-remote');
assert.strictEqual(packet.safety.preserveIdentity, true);
assert.strictEqual(packet.safety.missionSideChannel, true);
assert.throws(() => codeBrowserRegistrationPacket({}), /code_browser_tunnel_name_required/);

console.log('BHY code browser tunnel packet tests passed');
