// B"H — The Awtsmoos guards each installation's one living promise.
const crypto = require("node:crypto"), fs = require("node:fs"), path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");
/**
 * @file Unix installer admission and recovery custody.
 * @description The Awtsmoos protects the living guardian from sleeping locks.
 */
const action = process.argv[2] || "", lock = path.resolve(process.argv[3] || ""), root = path.resolve(process.argv[4] || process.cwd());
if (action === "create") create(Number(process.argv[5] || 0));
else if (action === "alive") process.exit(live(readAt(lock)) ? 0 : 1);
else if (action === "owns") {
	const owner = readAt(lock);
	process.exit(live(owner) && owner.token === process.argv[5] && owner.pid === Number(process.argv[6] || 0) ? 0 : 1);
}
else if (action === "read") process.stdout.write(`${JSON.stringify(readAt(lock) || {})}\n`);
else if (action === "guard") guard().catch(error => { console.error(`Awtsmoos installer admission: ${error.message}`); process.exitCode = 1; });
else throw Error(`unknown_install_lock_action:${action}`);
function pidAlive(pid) {
	if (!Number.isSafeInteger(Number(pid)) || Number(pid) < 2) return false;
	try { process.kill(Number(pid), 0); return true; }
	catch (error) { return error.code === "EPERM"; }
}
function birth(pid) {
	try {
		return execFileSync("ps", ["-ww", "-p", String(pid), "-o", "lstart=", "-o", "command="],
			{ encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 3000 }).trim().slice(0, 2000);
	} catch { return ""; }
}
function readAt(directory) {
	try {
		if (!fs.lstatSync(directory).isDirectory()) return null;
		return JSON.parse(fs.readFileSync(path.join(directory, "owner.json"), "utf8"));
	} catch { return null; }
}
function live(owner = {}) {
	if (path.resolve(String(owner?.root || "")) !== root) return false;
	return Boolean(owner.signature) && pidAlive(owner.pid) && birth(owner.pid) === owner.signature;
}
function create(pid) {
	const evidence = birth(pid);
	if (!pidAlive(pid) || !evidence) throw Error("install_lock_owner_pid_invalid");
	const owner = { schemaVersion: 1, token: crypto.randomUUID(), pid, root, signature: evidence, createdAt: new Date().toISOString() };
	const file = path.join(lock, "owner.json"), temporary = `${file}.${process.pid}.tmp`;
	fs.writeFileSync(temporary, `${JSON.stringify(owner, null, 2)}\n`, { flag: "wx", mode: 0o600 });
	fs.renameSync(temporary, file);
	process.stdout.write(`${owner.token}\n`);
}
function runnerAlive(directory) {
	try {
		const receipt = JSON.parse(fs.readFileSync(path.join(path.dirname(directory),
			"installer-custody-current.json"), "utf8"));
		return receipt.terminal === false && pidAlive(receipt.runnerPid) &&
			/unix-install-custody\.cjs\s+run\b/.test(birth(receipt.runnerPid));
	} catch { return false; }
}
function releaseAbandonedRecovery(directory) {
	const recovery = `${directory}.recovering`;
	try {
		const stat = fs.lstatSync(recovery);
		if (!stat.isDirectory() || Date.now() - stat.mtimeMs < 30000) return false;
		if (runnerAlive(directory) || live(readAt(directory)) || live(readAt(recovery))) return false;
		const tombstone = `${recovery}.expired-${crypto.randomUUID()}`;
		fs.renameSync(recovery, tombstone);
		fs.rmSync(tombstone, { recursive: true, force: true });
		return true;
	} catch (error) { return error.code === "ENOENT"; }
}
function releaseOwned(directory, token) {
	if (readAt(directory)?.token === token) fs.rmSync(directory, { recursive: true, force: true });
}
function writeOwner(directory, recovering = false) {
	const token = crypto.randomUUID();
	try { fs.writeFileSync(path.join(directory, "owner.json"),
			JSON.stringify({ pid: process.pid, root, token, signature: birth(process.pid) }), { flag: "wx", mode: 0o600 });
	} catch (error) { if (["EEXIST", "ENOENT"].includes(error.code)) return null; throw error; }
	if (!recovering && fs.existsSync(`${directory}.recovering`)) { releaseOwned(directory, token); return null; }
	return token;
}
function claim(directory) {
	if (runnerAlive(directory)) return null;
	fs.mkdirSync(path.dirname(directory), { recursive: true, mode: 0o700 });
	const recovery = `${directory}.recovering`;
	if (fs.existsSync(recovery) && !releaseAbandonedRecovery(directory)) return null;
	try { fs.mkdirSync(directory, { mode: 0o700 }); return writeOwner(directory); }
	catch (error) { if (error.code !== "EEXIST") throw error; }
	if (runnerAlive(directory) || live(readAt(directory))) return null;
	if (!readAt(directory) && Date.now() - fs.lstatSync(directory).mtimeMs < 15000) return null;
	let recoveryToken = null;
	try { fs.mkdirSync(recovery, { mode: 0o700 }); recoveryToken = writeOwner(recovery); }
	catch (error) { if (error.code === "EEXIST") return null; throw error; }
	if (!recoveryToken) return null;
	try {
		if (runnerAlive(directory) || live(readAt(directory))) return null;
		const tombstone = `${directory}.stale-${crypto.randomUUID()}`;
		try { fs.renameSync(directory, tombstone); }
		catch (error) { if (error.code === "ENOENT") return null; throw error; }
		fs.rmSync(tombstone, { recursive: true, force: true });
		try { fs.mkdirSync(directory, { mode: 0o700 }); }
		catch (error) { if (error.code === "EEXIST") return null; throw error; }
		return writeOwner(directory, true);
	} finally { releaseOwned(recovery, recoveryToken); }
}
async function guard() {
	const [core, runtime, recoveryRoot, cwd] = process.argv.slice(3);
	if (![core, runtime, recoveryRoot, cwd].every(Boolean)) throw Error("paths_required");
	const directory = path.join(recoveryRoot, "transactions", "installer-singleflight.lock");
	const token = claim(directory);
	if (!token) { console.log('B"H — Installation already active or recovering; no duplicate started.'); return; }
	try {
		if (runnerAlive(directory)) return;
		const child = spawn(process.execPath, [path.join(runtime, "unix-install-custody.cjs"),
			"delegate", core, runtime, recoveryRoot, cwd], { cwd, env: process.env, stdio: "inherit" });
		const cancel = () => child.kill("SIGTERM");
		process.once("SIGTERM", cancel); process.once("SIGINT", cancel);
		const exit = await new Promise((resolve, reject) => {
			child.once("close", resolve); child.once("error", reject);
		});
		process.exitCode = exit ?? 1;
	} finally { releaseOwned(directory, token); }
}
