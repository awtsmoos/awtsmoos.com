//B"H
//Boruch Hashem
//Blessed be He

const LOCKS = new Map();

/**
 * @file Serializes the tiny assignment mutation boundary for one physical root.
 * @description
 * Agents may work concurrently after assignment, while selection and durable claim
 * creation remain one short critical section so newborn chats cannot share work.
 */
async function run(config, operation) {
	const key = [config.root || process.cwd(), config.deviceStateRoot || "device-state"].join("::");
	const previous = LOCKS.get(key) || Promise.resolve();
	let release;
	const current = new Promise(resolve => {
		release = resolve;
	});
	const tail = previous.then(() => current, () => current);
	LOCKS.set(key, tail);
	await previous.catch(() => {});
	try {
		return await operation();
	} finally {
		release();
		if (LOCKS.get(key) === tail) LOCKS.delete(key);
	}
}

module.exports = { run };
