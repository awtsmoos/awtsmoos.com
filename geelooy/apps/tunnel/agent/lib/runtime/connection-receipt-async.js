// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs/promises");
const path = require("node:path");

let pending = null;
let queuedDetails = null;

/**
	* @file Updates liveness only from the connection process named by the receipt.
	* @description The Awtsmoos lets the child refresh testimony for its parent owner.
	*/
function markServerSeen(root, fileName, details = {}) {
	queuedDetails = { ...(queuedDetails || {}), ...details };
	if (!pending) {
		pending = drain(root, fileName).finally(() => {
			pending = null;
		});
	}
	return pending;
}

async function drain(root, fileName) {
	let receipt = null;
	while (queuedDetails) {
		const details = queuedDetails;
		queuedDetails = null;
		receipt = await update(root, fileName, details);
	}
	return receipt;
}

async function update(root, fileName, details) {
	const target = path.join(root, fileName);
	let current;
	try {
		current = JSON.parse(await fs.readFile(target, "utf8"));
	} catch {
		return null;
	}
	const connectionPid = Number(current.connectionPid || current.pid);
	if (connectionPid !== process.pid || current.state !== "registered") {
		return current;
	}
	if (details.generation && Number(current.generation) !== Number(details.generation)) {
		return current;
	}
	const now = new Date().toISOString();
	const receipt = {
		...current,
		...details,
		state: "registered",
		pid: Number(current.ownerPid || current.pid),
		ownerPid: Number(current.ownerPid || current.pid),
		connectionPid: process.pid,
		registeredAt: current.registeredAt,
		lastServerMessageAt: now,
		updatedAt: now
	};
	const temporary = `${target}.${process.pid}.${Date.now()}.async.tmp`;
	await fs.mkdir(path.dirname(target), { recursive: true });
	await fs.writeFile(temporary, `${JSON.stringify(receipt, null, 2)}\n`, {
		mode: 0o600
	});
	await fs.rename(temporary, target);
	return receipt;
}

module.exports = { markServerSeen };
