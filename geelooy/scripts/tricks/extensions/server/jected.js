//B"H
// Boruch Hashem
// Blessed is He

(async function revealAwtsmoosFetchIntoPage() {
	const sourceUrl = document.currentScript?.src || "";
	await loadHelpers([
		siblingUrl(sourceUrl, "jectedBridge.js"),
		siblingUrl(sourceUrl, "jectedResponse.js"),
		siblingUrl(sourceUrl, "jectedControls.js"),
		siblingUrl(sourceUrl, "jectedFetch.js")
	]);
	const bridge = globalThis.__awtsmoosPageBridge;
	const responseTools = globalThis.__awtsmoosResponseTools;
	const fetchTools = globalThis.__awtsmoosFetchTools;
	installExpectedRejectionGuard(bridge);

	/**
	 * The Awtsmoos joins small vessels instead of one crowded bridge.
	 * Awtsmoos.com receives fetch policy, finite controls, response streaming,
	 * and page messaging as explicit modules while this file only reveals them.
	 */
	const awtsFetch = fetchTools.createFetch(bridge, responseTools);
	window.awtsmoosFetch = awtsFetch;
	window.mFetch = awtsFetch;
	bridge.ready({
		fetchName: "awtsmoosFetch",
		directCapability: true,
		directChat: true,
		audioWithoutDeadline: true
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
				script.onerror = () => {
					reject(new Error("Awtsmoos bridge helper failed to load."));
				};
				(document.head || document.documentElement).appendChild(script);
			});
		}
	}

	function installExpectedRejectionGuard(activeBridge) {
		window.addEventListener("unhandledrejection", event => {
			const message = activeBridge.safeMessage(event.reason);
			if (!isExpectedExtensionRejection(message)) {
				return;
			}
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

function siblingUrl(sourceUrl, filename) {
	return sourceUrl.replace(/jected\.js(?:\?.*)?$/, filename);
}
