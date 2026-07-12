// B"H

let tail = Promise.resolve();
let queued = 0;
let active = 0;
let completed = 0;
let failed = 0;
let maximumQueued = 0;

/**
 * B"H — The current CDP vessel owns one page socket, so browser mutations pass
 * through one honest doorway. No agent may replace another agent's target between
 * ensurePage and Runtime.evaluate while the client remains single-socket.
 */
async function run(operation) {
	const previous = tail;
	let release;
	const gate = new Promise(resolve => { release = resolve; });
	tail = previous.catch(() => {}).then(() => gate);
	queued += 1;
	maximumQueued = Math.max(maximumQueued, queued + active);
	await previous.catch(() => {});
	queued -= 1;
	active += 1;
	try {
		const result = await operation();
		completed += 1;
		return result;
	} catch (error) {
		failed += 1;
		throw error;
	} finally {
		active -= 1;
		release();
	}
}

function snapshot() {
	return { queued, active, completed, failed, maximumQueued };
}

function resetForTests() {
	tail = Promise.resolve();
	queued = 0;
	active = 0;
	completed = 0;
	failed = 0;
	maximumQueued = 0;
}

module.exports = { resetForTests, run, snapshot };
