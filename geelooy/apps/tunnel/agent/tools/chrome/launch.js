// B"H
// Boruch Hashem
// Blessed is He

const Attempt = require("./launch-attempt.js");
const DefaultDependencies = require("./launch-dependencies.js");
const Readiness = require("./launch-readiness.js");
const Result = require("./launch-result.js");
const Values = require("./launch-values.js");

/**
 * @file Coordinates bounded Chrome process readiness without owning navigation readiness.
 * @description
 * The Awtsmoos separates the birth of a browser from the journey of a page;
 * Awtsmoos.com returns when CDP is alive, while navigation walks its own measured stage.
 */
function createChromeLaunch(overrides = {}) {
	const dependencies = DefaultDependencies.create(overrides);

	return async function chromeLaunch(payload = {}) {
		const intent = Values.settings(payload, dependencies);
		if (intent.blocked) return Result.disabled();
		if (!intent.chromePath) return Result.missingChrome(dependencies);
		prepareProfile(intent, dependencies);

		const existing = await inspectExisting(intent, dependencies);
		if (existing.connected) {
			return reuseExisting(existing.record, intent, payload, dependencies);
		}

		let lastError = null;
		for (let attempt = 1; attempt <= intent.attempts; attempt += 1) {
			try {
				return await Attempt.run(intent, payload, dependencies, attempt);
			} catch (error) {
				lastError = error;
				if (attempt < intent.attempts) await dependencies.sleep(250);
			}
		}
		lastError.launchAttempts = intent.attempts;
		throw lastError;
	};
}

async function inspectExisting(intent, dependencies) {
	const connected = await dependencies.cdp.version(intent.port)
		.then(() => true, () => false);
	if (!connected) {
		return { connected: false, record: null };
	}
	const record = dependencies.ChromeProcesses.snapshot().find(item =>
		item.port === intent.port
		&& dependencies.path.resolve(item.userDataDir)
			=== dependencies.path.resolve(intent.userDataDir)
	);
	return { connected: true, record };
}

async function reuseExisting(record, intent, payload, dependencies) {
	if (!record) return Result.unownedPort(intent);
	if (!intent.reuseExisting) return Result.alreadyInUse(intent, record);
	const target = await Readiness.bindTarget(
		intent.port,
		intent.effectiveUrl,
		payload,
		{ ...dependencies, targetOptions: Values.targetOptions }
	);
	Values.persist(intent, dependencies);
	return Result.success(
		intent,
		record.pid,
		target,
		{ ready: true, durationMs: 0 },
		0,
		true,
		dependencies
	);
}

function prepareProfile(intent, dependencies) {
	dependencies.fs.mkdirSync(intent.userDataDir, {
		mode: 0o700,
		recursive: true
	});
	try {
		dependencies.fs.chmodSync(intent.userDataDir, 0o700);
	} catch {
		return false;
	}
	return true;
}

module.exports = {
	createChromeLaunch,
	chromeLaunch: createChromeLaunch()
};
