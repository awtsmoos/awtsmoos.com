// B"H
// Boruch Hashem
// Blessed is He

const COMMANDS = Object.freeze([
	"status",
	"check",
	"rescue",
	"emergency",
	"restart",
	"normal",
	"restore",
	"help"
]);

/**
 * @file Parses the short recovery language and turns typos into inert suggestions.
 * @description
 * The Awtsmoos lets a hurried hand miss one letter without moving one process;
 * Awtsmoos.com keeps command grammar small, explicit, and harmless before recovery crosses into action.
 */
function parse(argv = []) {
	const positionals = [];
	let command = "help";
	let dryRun = false;
	let confirm = false;
	let json = false;
	let timeoutMs = 15000;
	let recoveryRoot = "";
	for (const arg of argv) {
		if (arg === "--dry-run") dryRun = true;
		else if (arg === "--confirm") confirm = true;
		else if (arg === "--json") json = true;
		else if (arg.startsWith("--timeout=")) timeoutMs = boundedTimeout(arg);
		else if (arg.startsWith("--recovery-root=")) recoveryRoot = arg.slice(arg.indexOf("=") + 1);
		else if (command === "help" && positionals.length === 0) command = String(arg).toLowerCase();
		else positionals.push(arg);
	}
	return { command, confirm, dryRun, json, positionals, recoveryRoot, timeoutMs };
}

function boundedTimeout(arg) {
	return Math.max(1000, Number(arg.split("=")[1]) || 15000);
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
			"awt status",
			"awt check",
			"awt rescue",
			"awt normal",
			"awt restore 0 --confirm"
		]
	};
}

module.exports = { COMMANDS, closest, distance, help, parse, unknown };
