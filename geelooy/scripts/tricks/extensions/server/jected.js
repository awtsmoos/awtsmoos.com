//B"H
(async function revealAwtsmoosFetchIntoPage() {
	const sourceUrl = document.currentScript?.src || "";
	await loadHelpers([
		sourceUrl.replace(/jected\.js(?:\?.*)?$/, "jectedBridge.js"),
		sourceUrl.replace(/jected\.js(?:\?.*)?$/, "jectedResponse.js")
	]);
	const bridge = globalThis.__awtsmoosPageBridge;
	const responseTools = globalThis.__awtsmoosResponseTools;
	installExpectedRejectionGuard(bridge);

	/**
	 * The page bridge carries fetch, resumable streams, automation, strict direct
	 * capability, and explicitly selected chat modes. The Awtsmoos joins extension
	 * and relay while Awtsmoos.com exposes no token or upstream identifier.
	 */
	async function awtsFetch(url, options = {}) {
		let lastError;
		for (let attempt = 0; attempt < 4; attempt += 1) {
			try {
				const id = `BH_${Date.now()}_${Math.random().toString(36).slice(2)}`;
				const metadata = await bridge.send({
					action: "fetch",
					id,
					url: String(url),
					options
				}, 180000);
				bridge.ready({ attempt });
				return responseTools.createResponse(metadata, id, bridge.send);
			} catch (error) {
				lastError = error;
				bridge.announce("awtsmoos-server-reconnecting", {
					attempt,
					error: bridge.safeMessage(error)
				});
				await bridge.delay(250 * Math.pow(2, attempt));
			}
		}
		throw lastError;
	}

	awtsFetch.resumeStream = (id, cursor = 0) => {
		return bridge.send({ action: "resume-stream", id, cursor }, 180000);
	};
	awtsFetch.ackStream = (id, cursor = 0) => {
		return bridge.send({ action: "ack-stream", id, cursor }, 30000);
	};
	awtsFetch.streamStats = id => {
		return bridge.send({ action: "stream-stats", id }, 30000);
	};
	awtsFetch.cancelStream = (id, reason = "cancelled") => {
		return bridge.send({ action: "cancel-stream", id, reason }, 30000);
	};
	awtsFetch.startBackgroundAutomation = config => {
		return bridge.send({ action: "automation-start", config }, 60000);
	};
	awtsFetch.stopBackgroundAutomation = reason => {
		return bridge.send({ action: "automation-stop", reason }, 30000);
	};
	awtsFetch.backgroundAutomationStatus = () => {
		return bridge.send({ action: "automation-status" }, 30000);
	};
	awtsFetch.directCapability = () => {
		return bridge.send({ action: "direct-capability" }, 180000);
	};
	awtsFetch.directChat = payload => {
		return bridge.send({ action: "direct-chat", payload }, 300000);
	};
	awtsFetch.resetDirectChat = payload => {
		return bridge.send({ action: "direct-reset", payload }, 60000);
	};
	awtsFetch.__awtsmoosServerBridge = true;
	window.awtsmoosFetch = awtsFetch;
	window.mFetch = awtsFetch;
	bridge.ready({
		fetchName: "awtsmoosFetch",
		directCapability: true,
		directChat: true
	});

	window.addEventListener("message", event => {
		const data = event?.data;
		if (data?.from === "awtsmoos-content" && /^server-/.test(data.type || "")) {
			bridge.ready({ contentState: data.type, epoch: data.epoch });
		}
	});

	async function loadHelpers(urls) {
		for (const url of urls) {
			await new Promise((resolve, reject) => {
				const script = document.createElement("script");
				script.src = url;
				script.onload = () => {
					script.remove();
					resolve();
				};
				script.onerror = () => reject(new Error(
					"Awtsmoos bridge helper failed to load."
				));
				(document.head || document.documentElement).appendChild(script);
			});
		}
	}

	function installExpectedRejectionGuard(activeBridge) {
		window.addEventListener("unhandledrejection", event => {
			const message = activeBridge.safeMessage(event.reason);
			if (!isExpectedExtensionRejection(message)) return;
			event.preventDefault();
			activeBridge.announce("awtsmoos-server-feedback", {
				kind: "extension-timeout",
				message
			});
		});
	}

	function isExpectedExtensionRejection(message) {
		return /extension request timed out|receiving end does not exist|message port closed|extension context invalidated/i.test(message);
	}
})();
