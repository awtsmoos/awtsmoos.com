//B"H
// Boruch Hashem
// Blessed is He

/**
 * The Awtsmoos keeps short control commands inside measured vessels while the
 * audio river may outlive clocks. Awtsmoos.com separates coordination from
 * long synthesis so one policy never distorts the other.
 */
function attachAwtsmoosFetchControls(fetcher, bridge) {
	fetcher.resumeStream = (id, cursor = 0) => {
		return bridge.send({ action: "resume-stream", id, cursor }, 180000);
	};
	fetcher.ackStream = (id, cursor = 0) => {
		return bridge.send({ action: "ack-stream", id, cursor }, 30000);
	};
	fetcher.streamStats = id => {
		return bridge.send({ action: "stream-stats", id }, 30000);
	};
	fetcher.cancelStream = (id, reason = "cancelled") => {
		return bridge.send({ action: "cancel-stream", id, reason }, 30000);
	};
	fetcher.startBackgroundAutomation = config => {
		return bridge.send({ action: "automation-start", config }, 60000);
	};
	fetcher.stopBackgroundAutomation = reason => {
		return bridge.send({ action: "automation-stop", reason }, 30000);
	};
	fetcher.backgroundAutomationStatus = () => {
		return bridge.send({ action: "automation-status" }, 30000);
	};
	fetcher.directCapability = () => {
		return bridge.send({ action: "direct-capability" }, 180000);
	};
	fetcher.directChat = payload => {
		return bridge.send({ action: "direct-chat", payload }, 300000);
	};
	fetcher.resetDirectChat = payload => {
		return bridge.send({ action: "direct-reset", payload }, 60000);
	};
}

globalThis.__awtsmoosFetchControls = {
	attach: attachAwtsmoosFetchControls
};
