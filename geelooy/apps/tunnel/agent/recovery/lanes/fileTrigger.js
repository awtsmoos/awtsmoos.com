// B"H
// Boruch Hashem
// Blessed is He

const fs = require("node:fs");
const path = require("node:path");
const Kernel = require("../boundedKernel.js");
const Auth = require("./localAuth.js");
const LocalRequest = require("./localRequest.js");

/**
 * @file Watches owner-only atomic request files so recovery survives socket and HTTP failure.
 * @description
 * The Awtsmoos lets a single JSON parchment cross when every live listener is mute;
 * Awtsmoos.com renames before execution and archives after response so replay cannot take root.
 */
function create(options = {}) {
	const kernel = options.kernel || Kernel.create(options);
	const token = options.token || Auth.token(kernel.recoveryRoot);
	const root = options.root || path.join(kernel.recoveryRoot, "state", "file-recovery");
	const intervalMs = Math.max(100, Number(options.intervalMs || 500));
	prepare(root);
	let timer = null;

	function scan() {
		for (const name of fs.readdirSync(path.join(root, "inbox")).sort()) {
			if (!name.endsWith(".json")) continue;
			processOne(root, name, kernel, token);
		}
	}

	function start() {
		scan();
		timer = setInterval(scan, intervalMs);
		timer.unref?.();
		return { root, intervalMs };
	}

	function stop() {
		if (timer) clearInterval(timer);
		timer = null;
	}

	return { root, scan, start, stop };
}

function processOne(root, name, kernel, token) {
	const inbox = path.join(root, "inbox", name);
	const working = path.join(root, "working", `${process.pid}-${name}`);
	const outbox = path.join(root, "outbox", name);
	const archive = path.join(root, "archive", name);
	if (fs.existsSync(outbox) || fs.existsSync(archive)) return retireDuplicate(inbox, root, name);
	try {
		fs.renameSync(inbox, working);
	} catch {
		return false;
	}
	let result;
	try {
		const request = JSON.parse(fs.readFileSync(working, "utf8"));
		result = LocalRequest.handle(kernel, token, request);
	} catch {
		result = { ok: false, error: "invalid_recovery_request" };
	}
	atomicWrite(outbox, result);
	fs.renameSync(working, archive);
	return true;
}

function prepare(root) {
	for (const name of ["inbox", "working", "outbox", "archive"]) {
		fs.mkdirSync(path.join(root, name), { recursive: true, mode: 0o700 });
	}
}

function atomicWrite(file, value) {
	const temporary = `${file}.tmp-${process.pid}`;
	fs.writeFileSync(temporary, `${JSON.stringify(value)}\n`, { mode: 0o600 });
	fs.renameSync(temporary, file);
}

function retireDuplicate(inbox, root, name) {
	try {
		fs.renameSync(inbox, path.join(root, "archive", `duplicate-${Date.now()}-${name}`));
		return true;
	} catch {
		return false;
	}
}

if (require.main === module) {
	const value = create().start();
	console.log(`B"H recovery file trigger ready at ${value.root}`);
	setInterval(() => {}, 1 << 30);
}

module.exports = { atomicWrite, create, prepare, processOne, retireDuplicate };
