#!/usr/bin/env node
//B"H
// Boruch Hashem
// Blessed is He

const { loadConfig } = require("../config.cjs");
const {
	openDebugChrome,
	closeDebugChrome
} = require("../cdpChrome.cjs");
const {
	loadDirectService,
	closeDirectService
} = require("../directServiceLoader.cjs");
const { ManualLoginGate } = require("./ManualLoginGate.cjs");
const { runStrictNoDomStress } = require("./StrictNoDomStress.cjs");
const { runVerificationSuite } = require("./VerificationSuite.cjs");

/**
 * The operator enters by hand, the chamber closes, deterministic gates pass, and
 * only then does a fresh authenticated request host rise for strict no-DOM stress.
 */
async function main() {
	const config = loadConfig();
	const login = await new ManualLoginGate().authenticate(config);
	console.log("Authentication detected; the manual login browser is closed.");
	const verification = runVerificationSuite();
	console.log("Automated verification passed; reopening the authenticated profile.");
	process.env.AWTSMOOS_CHROME_DEBUG_PORT = String(login.debugPort);
	process.env.AWTSMOOS_DIRECT_INTERVAL_MS = String(stressGapMs());
	const reopened = await openDebugChrome({
		...config,
		debugPort: login.debugPort,
		launchUrl: `${config.targetOrigin}/settings`
	});
	if (!reopened.ok) {
		throw codedError("authenticated_profile_reopen_failed");
	}
	let stress = null;
	try {
		const service = await loadDirectService(config);
		stress = await runStrictNoDomStress({
			service,
			conversations: positiveInteger(
				process.env.AWTSMOOS_STRESS_CONVERSATIONS,
				4
			),
			messages: positiveInteger(process.env.AWTSMOOS_STRESS_MESSAGES, 7),
			minimumGapMs: stressGapMs()
		});
	} finally {
		await closeDirectService(config).catch(() => undefined);
		await closeDebugChrome({
			...config,
			debugPort: login.debugPort
		}).catch(() => undefined);
	}
	console.log(JSON.stringify({
		ok: true,
		login,
		verification,
		stress,
		browserClosed: true,
		domInteraction: false
	}, null, 2));
}

function stressGapMs() {
	return Math.max(
		10000,
		positiveInteger(process.env.AWTSMOOS_DIRECT_INTERVAL_MS, 10000)
	);
}

function positiveInteger(value, fallback) {
	const number = Number(value);
	return Number.isInteger(number) && number > 0 ? number : fallback;
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

main().catch(error => {
	console.error(JSON.stringify({
		ok: false,
		status: error?.code || "login_and_stress_failed",
		report: error?.report || undefined
	}, null, 2));
	process.exitCode = 1;
});
