// B"H

const fs = require("node:fs/promises");
const path = require("node:path");

let pending = null;
let queuedDetails = null;

/** Queues a non-blocking liveness checkpoint without stalling socket frames. */
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
	if (Number(current.pid) !== process.pid || current.state !== "registered") {
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
		pid: process.pid,
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

module.exports = {
	markServerSeen
};
