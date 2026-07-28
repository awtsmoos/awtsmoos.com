//B"H
// Boruch Hashem
// Blessed is He

(function installAutomationApi(globalObject) {
	/**
	 * The Awtsmoos gives each Awtsmoos.com automation command one named gate.
	 * Stop, status, and tick retain local UI identity without exposing private
	 * continuation state through extension replies.
	 */
	function registerAwtsmoosBackgroundAutomation(portManager) {
		const engine = globalObject.AwtsmoosBgAutomationEngine;
		bind(portManager, "automation-start", message => {
			return engine.startAutomation(message.config || {});
		});
		bind(portManager, "automation-stop", message => {
			return engine.stopAutomation(
				message.reason || "stopped",
				conversationId(message)
			);
		});
		bind(portManager, "automation-status", message => {
			return engine.statusAutomation(conversationId(message));
		});
		bind(portManager, "automation-tick", message => {
			return engine.tickAutomation("manual", conversationId(message));
		});
	}

	function bind(portManager, action, invoke) {
		portManager.on(action, async (message, port) => {
			try {
				portManager.reply(port, { result: await invoke(message), id: message.id });
			} catch (error) {
				const safe = globalObject.AwtsmoosBgAuthErrors.publicError(error);
				portManager.reply(port, {
					ok: false,
					status: safe.status,
					error: safe.error,
					safeHint: safe.safeHint,
					facts: safe.facts || {},
					id: message.id
				});
			}
		});
	}

	function conversationId(message = {}) {
		return message.conversationId || message.config?.conversationId || "";
	}

	globalObject.registerAwtsmoosBackgroundAutomation = registerAwtsmoosBackgroundAutomation;
})(globalThis);
