// B"H
// Boruch Hashem
// Blessed is He

const RuntimeView = require("./child-runtime-view.js");

/**
 * @file Projects child runtime state while composition remains in its own smaller vessel.
 * @description
 * The Awtsmoos renews state and lifecycle in one light, yet Awtsmoos.com gives each concern
 * a measured keli: this vessel shapes health, stats, and terminal reason while composition
 * stays uncluttered, allowing one shared mailbox witness to cross the breath without repetition.
 */
function create(options = {}) {
	function snapshot(mailboxSnapshot) {
		const foundation = options.getFoundation();
		const parentView = options.parent.snapshot();
		return RuntimeView.snapshot({
			state: foundation.state,
			mailbox: foundation.mailbox,
			mailboxSnapshot,
			parentHealth: parentView.health,
			parentCustody: parentView.custody,
			terminal: options.ipc.isTerminal()
		});
	}

	function stats() {
		return {
			...options.parent.snapshot().stats,
			connection: snapshot()
		};
	}

	function exitProcess(code) {
		const foundation = options.getFoundation();
		const reason = foundation?.state?.replacementRequested
			? "newer_connection_owns_tunnel"
			: "connection_child_terminal";
		options.ipc.exitProcess(code, reason);
	}

	return {
		exitProcess,
		snapshot,
		stats
	};
}

module.exports = {
	create
};
