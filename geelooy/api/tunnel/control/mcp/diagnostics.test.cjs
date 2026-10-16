//B"H
//Boruch Hashem
//Blessed is He

const test = require('node:test');
const assert = require('node:assert/strict');
const { diagnoseDevice } = require('./diagnostics.js');
const { tools } = require('./toolCatalog.js');

test('doctor never equates transport, grant and execution evidence', () => {
	const native={vesselType:'native',connected:true,livenessState:'connected',access:'shared',permissions:['tunnel.read'],capabilities:{commandRun:true,fsRead:true}};
	const denied=diagnoseDevice(native,{scopes:['tunnel.read']});
	assert.equal(denied.canAttemptNativeCommand,false);
	assert.equal(denied.commandSuccessCertified,false);
	assert(denied.warnings.includes('PRINCIPAL_COMMAND_SCOPE_MISSING'));
	assert(denied.warnings.includes('DEVICE_COMMAND_GRANT_MISSING'));
	const eligible=diagnoseDevice({...native,permissions:['tunnel.read','tunnel.command']},{scopes:['tunnel.read','tunnel.command']});
	assert.equal(eligible.canAttemptNativeCommand,true);
	assert.equal(eligible.commandSuccessCertified,false);
	assert(eligible.warnings.includes('FRESH_COMMAND_SUCCESS_NOT_PROVED'));
	const proved=diagnoseDevice({...native,permissions:['tunnel.command'],executionHealthy:true,executionHealthFresh:true,acceptanceHealthy:true,acceptanceHealthFresh:true},{scopes:['tunnel.command']});
	assert.equal(proved.commandSuccessCertified,true);
	assert.equal(diagnoseDevice({...native,connected:false},{scopes:['tunnel.command']}).warnings.includes('TUNNEL_OFFLINE'),true);
});
test('doctor is discoverable as an explicitly read-only MCP tool',()=>{
	const tool=tools.find(item=>item.name==='awtsmoos_tunnel_doctor');
	assert(tool);
	assert.deepEqual(tool.annotations,{readOnlyHint:true,destructiveHint:false,openWorldHint:false});
});
