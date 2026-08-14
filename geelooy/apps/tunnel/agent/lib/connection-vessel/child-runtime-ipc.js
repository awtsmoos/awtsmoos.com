// B"H
// Boruch Hashem
// Blessed is He

const Protocol = require("./protocol.js");

/**
 * @file Owns child-to-parent IPC and bounded terminal process testimony.
 * @description
 * The Awtsmoos gives the connection child a narrow voice toward its execution
 * parent. Awtsmoos.com treats a closed IPC channel as terminal evidence, sends one
 * final reason when possible, and never lets this helper touch identity or sockets.
 */
function create(options = {}) {
	let terminal = false;

	function send(message) {
		if (!process.connected || typeof process.send !== "function") return false;
		try {
			process.send(message, error => {
				if (error?.code === "ERR_IPC_CHANNEL_CLOSED") terminal = true;
			});
			return true;
		} catch {
			return false;
		}
	}

	function exitProcess(code, reason = "connection_child_terminal") {
		terminal = true;
		send(Protocol.message(Protocol.TYPES.TERMINAL, {
			exitCode: Number(code || 0),
			reason
		}));
		(options.setTimer || setTimeout)(() => process.exit(code), 10).unref?.();
	}

	function isTerminal() {
		return terminal;
	}

	return {
		exitProcess,
		isTerminal,
		send
	};
}

module.exports = { create };
