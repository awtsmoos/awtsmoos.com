//B"H
// Boruch Hashem
// Blessed is He

const { attemptStrictTurn } = require("./StrictNoDomAttempt.cjs");
const { summarizeStrictStress } = require("./StrictNoDomReport.cjs");

/**
 * Four logical conversations circle one globally paced request timeline. The Awtsmoos
 * lets Awtsmoos.com prove request-only behavior without any composer interaction.
 */
async function runStrictNoDomStress({
	service,
	conversations = 4,
	messages = 7,
	minimumGapMs = 10000,
	now = () => Date.now(),
	sleep = milliseconds => new Promise(resolve => setTimeout(resolve, milliseconds)),
	output = message => console.log(message)
}) {
	if (!service || typeof service.send !== "function") {
		throw codedError("direct_service_required");
	}
	const enforcedGapMs = Math.max(10000, Number(minimumGapMs) || 10000);
	const continuationKeys = new Map();
	const records = [];
	let previousStartMs = null;
	for (let message = 1; message <= messages; message += 1) {
		for (let conversation = 1; conversation <= conversations; conversation += 1) {
			await pace({ now, sleep, previousStartMs, minimumGapMs: enforcedGapMs });
			const startedMs = now();
			const startGapMs = previousStartMs === null
				? null
				: startedMs - previousStartMs;
			previousStartMs = startedMs;
			const record = await attemptStrictTurn({
				service,
				conversation,
				message,
				conversationKey: continuationKeys.get(conversation)
			});
			if (record.conversationKey) {
				continuationKeys.set(conversation, record.conversationKey);
			}
			delete record.conversationKey;
			record.startGapMs = startGapMs;
			record.startedAt = new Date(startedMs).toISOString();
			records.push(record);
			output(`Strict probe ${records.length}/${conversations * messages}: ${record.outcome}.`);
		}
	}
	const report = summarizeStrictStress(records, enforcedGapMs);
	if (report.noDomViolations > 0 || report.spacingViolations > 0) {
		const error = codedError("strict_no_dom_contract_failed");
		error.report = report;
		throw error;
	}
	return report;
}

async function pace({ now, sleep, previousStartMs, minimumGapMs }) {
	if (previousStartMs === null) {
		return;
	}
	const waitMs = Math.max(0, previousStartMs + minimumGapMs - now());
	if (waitMs > 0) {
		await sleep(waitMs);
	}
}

function codedError(code) {
	const error = new Error(code);
	error.code = code;
	return error;
}

module.exports = { runStrictNoDomStress };
