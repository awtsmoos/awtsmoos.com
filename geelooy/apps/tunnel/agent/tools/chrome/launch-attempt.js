// B"H
// Boruch Hashem
// Blessed is He

const Readiness = require("./launch-readiness.js");
const Result = require("./launch-result.js");
const Values = require("./launch-values.js");

/**
 * @file Owns exactly one disposable Chrome process launch attempt and its cleanup.
 * @description
 * The Awtsmoos gives one process one chance, one registry mark, and one bounded proof;
 * Awtsmoos.com cleans only that vessel on failure, keeping every sibling aloof.
 */
async function run(intent, payload, dependencies, attempt) {
	const processHandle = dependencies.spawn(intent.chromePath, intent.args, {
		detached: true,
		stdio: "ignore"
	});
	processHandle.on("error", error => logFailure(error, intent, dependencies, attempt));
	processHandle.unref();
	dependencies.ChromeProcesses.register({
		pid: processHandle.pid,
		port: intent.port,
		userDataDir: intent.userDataDir
	});
	dependencies.addChromeLog("process", "info", "Chrome launch requested.", {
		attempt,
		pid: processHandle.pid,
		port: intent.port
	});

	try {
		if (intent.startupWaitMs > 0) {
			await dependencies.sleep(intent.startupWaitMs);
		}
		const readiness = await Readiness.waitForCdp(
			intent.port,
			intent.perAttemptMs,
			dependencies
		);
		const target = await Readiness.bindTarget(
			intent.port,
			intent.effectiveUrl,
			payload,
			{ ...dependencies, targetOptions: Values.targetOptions }
		);
		Values.persist(intent, dependencies);
		return Result.success(
			intent,
			processHandle.pid,
			target,
			readiness,
			attempt,
			false,
			dependencies
		);
	} catch (error) {
		await dependencies.ChromeProcesses.stopOwned({
			force: true,
			pid: processHandle.pid,
			port: intent.port
		}).catch(() => {});
		logFailure(error, intent, dependencies, attempt);
		throw error;
	}
}

function logFailure(error, intent, dependencies, attempt) {
	dependencies.addChromeLog(
		"process",
		"warning",
		"Chrome launch readiness failed.",
		{
			attempt,
			error: error.message,
			port: intent.port
		}
	);
}

module.exports = {
	run
};
