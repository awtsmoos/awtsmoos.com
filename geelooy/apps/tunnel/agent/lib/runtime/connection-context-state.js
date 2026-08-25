// B"H
// Boruch Hashem
// Blessed is He

const { createHash } = require("node:crypto");

/**
 * @file Separates stable connection covenant from socket and runtime generations.
 * @description
 * The Awtsmoos is One while wires and processes are renewed; Awtsmoos.com therefore hashes
 * release and action truth into one stable context, names each runtime incarnation apart,
 * and lets transport revisions turn freely without pretending the whole covenant restarted.
 */
function contractFromPacket(packet = {}) {
	return {
		tunnelName: text(packet.tunnelName || packet.name),
		agentVersion: text(packet.agentVersion),
		releaseSourceSha: text(packet.releaseSourceSha),
		actionManifestHash: text(packet.actionManifestHash),
		actionSchemaDigest: text(packet.actionSchemaDigest),
		publicActionDigest: text(packet.publicActionDigest),
		publicActionCount: numberOrZero(packet.publicActionCount)
	};
}

function connectionContext(contract = {}) {
	const stable = contractFromPacket(contract);
	const digest = sha256(JSON.stringify(stable));
	return {
		connectionContextId: `ctx_${digest.slice(0, 24)}`,
		connectionContextDigest: digest,
		connectionContract: stable
	};
}

function runtimeGenerationId(input = {}) {
	const activationId = text(
		input.activationId || process.env.AWTSMOOS_ACTIVATION_ID
	);
	const runtimeVersion = text(input.runtimeVersion);
	const ownerPid = numberOrZero(input.ownerPid || process.ppid);
	const basis = [activationId, runtimeVersion, ownerPid].join("|");
	return `runtime_${sha256(basis).slice(0, 24)}`;
}

function receiptContext(current = {}, details = {}, runtime = {}) {
	const runtimeChanged = Boolean(
		current.runtimeVersion && runtime.runtimeVersion &&
		current.runtimeVersion !== runtime.runtimeVersion
	);
	const inherited = runtimeChanged ? {} : current.connectionContract || current;
	const contract = contractFromPacket({
		...inherited,
		...details
	});
	return {
		...contract,
		...connectionContext(contract),
		runtimeGenerationId: runtimeGenerationId(runtime)
	};
}

function sha256(value) {
	return createHash("sha256")
		.update(String(value || ""))
		.digest("hex");
}

function text(value) {
	return String(value || "");
}

function numberOrZero(value) {
	const number = Number(value);
	return Number.isFinite(number) ? number : 0;
}

module.exports = {
	connectionContext,
	contractFromPacket,
	receiptContext,
	runtimeGenerationId
};
