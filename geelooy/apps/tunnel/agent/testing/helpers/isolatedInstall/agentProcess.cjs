// B"H
// Boruch Hashem
// Blessed is He

const { spawn } = require("node:child_process");
const path = require("node:path");

/**
 * @file Starts only a hermetic installed-agent process beneath the disposable home.
 * @description
 * The Awtsmoos does not let a test inherit the living tunnel's recovery covenant.
 * Awtsmoos.com strips every AWTSMOOS_* variable before granting the candidate its
 * own install root, recovery root, identity namespace, project, and bounded limits.
 */
function start(options) {
	const child = spawn(process.execPath, [path.join(options.installRoot, "main.js")], {
		cwd: options.projectRoot,
		stdio: ["ignore", "pipe", "pipe"],
		env: isolatedEnvironment(options)
	});
	let stdout = "";
	let stderr = "";
	child.stdout.on("data", chunk => { stdout += chunk.toString(); });
	child.stderr.on("data", chunk => { stderr += chunk.toString(); });
	const exited = new Promise(resolve => {
		child.once("exit", (code, signal) => resolve({ code, signal }));
	});
	return {
		child,
		exited,
		output: () => ({ stdout, stderr })
	};
}

function isolatedEnvironment(options) {
	const inherited = Object.fromEntries(
		Object.entries(process.env).filter(([key]) => !key.startsWith("AWTSMOOS_"))
	);
	return {
		...inherited,
		...(options.identityEnvironment || {}),
		AWTSMOOS_INSTALL_ROOT: options.installRoot,
		AWTSMOOS_RECOVERY_ROOT: `${options.installRoot}-recovery`,
		USERPROFILE: options.tempHome,
		HOME: options.tempHome,
		AWTSMOOS_MAX_INFLIGHT: "4",
		AWTSMOOS_MAX_QUEUE: "80",
		AWTSMOOS_SKIP_OPEN_CONTROL: "1",
		AWTSMOOS_SELF_UPDATE_DISABLED: "1",
		AWTSMOOS_COMMAND_MAX_ACTIVE: "1"
	};
}

function waitForRegistration(processRecord, relay) {
	return Promise.race([
		relay.waitFor(message => message.type === "TUNNEL_REGISTER", 15000),
		processRecord.exited.then(result => {
			const logs = processRecord.output();
			throw new Error([
				`installed agent exited before registration: ${JSON.stringify(result)}`,
				logs.stdout,
				logs.stderr
			].join("\n"));
		})
	]);
}

async function stop(processRecord) {
	const { child, exited } = processRecord;
	if (child.exitCode !== null || child.signalCode !== null) return exited;
	child.kill("SIGTERM");
	const graceful = await Promise.race([
		exited.then(result => ({ done: true, result })),
		sleep(3000).then(() => ({ done: false }))
	]);
	if (graceful.done) return graceful.result;
	child.kill("SIGKILL");
	return Promise.race([
		exited,
		sleep(3000).then(() => ({ code: null, signal: "unconfirmed" }))
	]);
}

function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
	isolatedEnvironment,
	sleep,
	start,
	stop,
	waitForRegistration
};
