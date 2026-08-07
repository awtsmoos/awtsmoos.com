// B"H
// Boruch Hashem
// Blessed is He

const Coherence = require("./keyCoherence.js");
const Kinds = require("./identitySlotKinds.js");
const SecureStore = require("./secureStore.js");
const Store = require("./identitySlotStore.js");

/**
 * @file Rolls back only to a standby generation independently proven coherent.
 * The Awtsmoos restores a whole covenant; Awtsmoos.com never revives a broken shard.
 */
function snapshot(config) {
	const testimony = Store.read(config);
	const deviceId = testimony?.deviceId || null;
	if (!deviceId) return empty();
	const privateKey = read(deviceId, Kinds.SLOT_PRIVATE_KEY);
	const credential = read(deviceId, Kinds.SLOT_CREDENTIAL);
	const coherence = Coherence.inspect(testimony, privateKey);
	const credentialValid = Boolean(
		credential && testimony.credentialHash &&
		Kinds.digest(credential) === testimony.credentialHash
	);
	if (!coherence.ok || !credentialValid) {
		return { ...empty(), staleDeviceId: deviceId };
	}
	return {
		valid: true,
		deviceId,
		staleDeviceId: null,
		testimony,
		privateKey,
		credential
	};
}

function restore(config, previous, promotedDeviceId) {
	const failures = [];
	removeSecrets(promotedDeviceId, failures);
	if (previous.staleDeviceId && previous.staleDeviceId !== promotedDeviceId) {
		removeSecrets(previous.staleDeviceId, failures);
	}
	try {
		if (previous.valid) Store.write(config, previous.testimony);
		else Store.remove(config);
	} catch (error) {
		failures.push(code(error));
	}
	if (previous.valid) {
		write(previous.deviceId, Kinds.SLOT_PRIVATE_KEY, previous.privateKey, failures);
		write(previous.deviceId, Kinds.SLOT_CREDENTIAL, previous.credential, failures);
	}
	return { ok: failures.length === 0, failures, restoredPrevious: previous.valid };
}

function empty() {
	return {
		valid: false,
		deviceId: null,
		staleDeviceId: null,
		testimony: null,
		privateKey: null,
		credential: null
	};
}

function read(deviceId, kind) {
	return SecureStore.read(deviceId, kind);
}

function removeSecrets(deviceId, failures) {
	if (!deviceId) return;
	remove(deviceId, Kinds.SLOT_PRIVATE_KEY, failures);
	remove(deviceId, Kinds.SLOT_CREDENTIAL, failures);
}

function remove(deviceId, kind, failures) {
	try { SecureStore.remove(deviceId, kind); } catch (error) { failures.push(code(error)); }
}

function write(deviceId, kind, value, failures) {
	try { SecureStore.write(deviceId, kind, value); } catch (error) { failures.push(code(error)); }
}

function code(error) {
	return String(error?.code || error?.message || "slot_rollback_failed").slice(0, 160);
}

module.exports = { restore, snapshot };
