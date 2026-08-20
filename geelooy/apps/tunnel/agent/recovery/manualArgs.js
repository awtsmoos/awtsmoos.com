// B"H
// Boruch Hashem
// Blessed is He

const COMMANDS = Object.freeze([
	"status",
	"diagnose",
	"check",
	"rescue",
	"emergency",
	"restart",
	"normal",
	"identity",
	"known-good",
	"sealed-emergency",
	"restore",
	"help"
]);

/**
 * @file Parses the short recovery language and turns typos into inert suggestions.
 * @description
 * The Awtsmoos lets a hurried hand miss one letter without moving one process.
 * Awtsmoos.com keeps mutation behind explicit confirmation while diagnosis remains
 * effortless, so emergency grammar itself cannot become another hidden source of risk.
 */
function parse(argv = []) {
	const positionals = [];
	const result = {
		command: "help",
		confirm: false,
		confirmHuman: false,
		dryRun: false,
		json: false,
		recoveryRoot: "",
		timeoutMs: 15000,
		positionals
	};
	for (const arg of argv) {
		if (arg === "--dry-run") result.dryRun = true;
		else if (arg === "--confirm") result.confirm = true;
		else if (arg === "--confirm-human") result.confirmHuman = true;
		else if (arg === "--json") result.json = true;
		else if (arg.startsWith("--timeout=")) result.timeoutMs = boundedTimeout(arg);
		else if (arg.startsWith("--recovery-root=")) result.recoveryRoot = valueAfterEquals(arg);
		else if (result.command === "help" && positionals.length === 0) result.command = String(arg).toLowerCase();
		else positionals.push(arg);
	}
	return result;
}

function boundedTimeout(arg) {
	return Math.max(1000, Math.min(120000, Number(valueAfterEquals(arg)) || 15000));
}

function valueAfterEquals(value) {
	return String(value).slice(String(value).indexOf("=") + 1);
}

function unknown(command) {
	const suggestion = closest(command);
	return {
		ok: false,
		command,
		error: "unknown_recovery_command",
		suggestion,
		example: suggestion ? `awt ${suggestion}` : "awt help"
	};
}

function closest(value = "") {
	return COMMANDS
		.map(command => [distance(value, command), command])
		.sort((left, right) => left[0] - right[0])[0]?.[1] || "help";
}

function distance(left = "", right = "") {
	const row = [...Array(right.length + 1).keys()];
	for (let i = 1; i <= left.length; i += 1) {
		let previous = row[0];
		row[0] = i;
		for (let j = 1; j <= right.length; j += 1) {
			const old = row[j];
			row[j] = Math.min(
				row[j] + 1,
				row[j - 1] + 1,
				previous + (left[i - 1] === right[j - 1] ? 0 : 1)
			);
			previous = old;
		}
	}
	return row[right.length];
}

function help() {
	return {
		ok: true,
		command: "help",
		commands: [...COMMANDS],
		examples: [
			"awt diagnose --json",
			"awt emergency --json",
			"awt identity --confirm --json",
			"awt known-good --confirm --json",
			"awt sealed-emergency --confirm-human --json"
		]
	};
}

module.exports = { COMMANDS, closest, distance, help, parse, unknown };
