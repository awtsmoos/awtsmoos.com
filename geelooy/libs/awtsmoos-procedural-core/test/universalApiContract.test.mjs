// B"H
// Boruch Hashem
// Blessed is He

/**
 * @file universalApiContract.test.mjs
 * @description Proves Universal API introspection is complete, deterministic, serializable, immutable, compatibility-preserving, and derived from live registry truth.
 * The Awtsmoos lets one contract reveal every finite method without replacing the method itself;
 * Awtsmoos.com tests that discovery mirrors execution faithfully, so professional tooling receives evidence rather than decorative wealth.
 */

import assert from "node:assert/strict";
import {
	ERROR_CODES,
	RESOURCE_BUCKETS,
	RuntimeAdapter,
	UNIVERSAL_API_ID,
	WORLD_FORMAT,
	createUniversalAwtsmoosApi
} from "../src/core/universalApi/index.js";

const api = createUniversalAwtsmoosApi();
const contractReceipt = await api.api.contract({});
const capabilitiesReceipt = await api.api.capabilities({});
const contract = contractReceipt.result;
const capabilities = capabilitiesReceipt.result;
const registryMethods = api.registry.list().sort((left, right) => left.id.localeCompare(right.id));
const registryIds = registryMethods.map(method => method.id);

assert.equal(contractReceipt.ok, true);
assert.equal(contract.api, UNIVERSAL_API_ID);
assert.equal(contract.worldFormat, WORLD_FORMAT);
assert.equal(contract.protocol.id, UNIVERSAL_API_ID);
assert.equal(contract.protocol.rendererNeutral, true);
assert.equal(contract.protocol.portableJson, true);
assert.equal(contract.protocol.deterministicCore, true);
assert.equal(contract.protocol.executionDeterminism, "input-and-provider-dependent");
assert.equal(contract.protocol.runtimeAdapter, false);
assert.deepEqual(contract.errors, ERROR_CODES);
assert.deepEqual(contract.resources, RESOURCE_BUCKETS);
assert.deepEqual(contract.methods.map(method => method.id), registryIds);
assert.equal(contract.summary.methodCount, registryMethods.length);
assert.equal(contract.summary.namespaceCount, Object.keys(api.registry.namespaces()).length);
assert.equal(contract.summary.mutatingMethods + contract.summary.readOnlyMethods, registryMethods.length);
assert.equal(contract.summary.stableMethods + contract.summary.experimentalMethods, registryMethods.length);

for (const methodContract of contract.methods) {
	const registryMethod = registryMethods.find(method => method.id === methodContract.id);
	assert.equal(methodContract.namespace, registryMethod.namespace);
	assert.equal(methodContract.runtimeName, registryMethod.runtimeName);
	assert.equal(methodContract.stability, registryMethod.stability);
	assert.equal(methodContract.transaction, registryMethod.transaction);
	assert.equal(methodContract.mutates, registryMethod.mutates);
	assert.equal(methodContract.undo, registryMethod.undo);
	assert.equal(methodContract.cost, registryMethod.cost);
	assert.deepEqual(methodContract.permissions, registryMethod.permissions);
	assert.deepEqual(methodContract.sideEffects, registryMethod.sideEffects);
}

assert.equal(capabilities.jsonRuntimeParity, true);
assert.equal(capabilities.dryRun, true);
assert.equal(capabilities.atomicBatch, true);
assert.equal(capabilities.undoRedo, true);
assert.equal(capabilities.multiDocumentComposition, true);
assert.equal(capabilities.runtimeAdapter, false);
assert.deepEqual(capabilities.methods, contract.methods.map(method => ({
	id: method.id,
	stability: method.stability
})));
assert.deepEqual(capabilities.methodContracts, contract.methods);
assert.deepEqual(JSON.parse(JSON.stringify(contract)), contract);
assert.equal(Object.isFrozen(contract), true);
assert.equal(Object.isFrozen(contract.methods), true);

const repeated = (await api.api.contract({})).result;
assert.deepEqual(repeated, contract, "repeated contract introspection is deterministic");

const adaptedApi = createUniversalAwtsmoosApi({ runtimeAdapter: new RuntimeAdapter() });
const adaptedContractReceipt = await adaptedApi.api.contract({});
const adaptedCapabilitiesReceipt = await adaptedApi.api.capabilities({});
assert.equal(adaptedContractReceipt.ok, true);
assert.equal(adaptedCapabilitiesReceipt.ok, true);
assert.equal(adaptedContractReceipt.result.protocol.runtimeAdapter, true);
assert.equal(adaptedCapabilitiesReceipt.result.runtimeAdapter, true);

console.log(`B"H | universalApiContract.test.mjs passed | methods=${contract.summary.methodCount}`);
